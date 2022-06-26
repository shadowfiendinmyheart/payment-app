import { useEffect, useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { Card, Group, Box, TextInput } from "@mantine/core";
import GradientButton from "../components/GradientButton";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { PaymentFields } from "../interfaces/payment";
import isValidValue from "../utils/isValidValue";

import styles from "../styles/Home.module.css";

const expirationDateValidate = (value: string) => {
  if (value.length !== 7) return "Wrong format";

  const [MM, YYYY] = value.split("/");

  if (!MM || !YYYY) return "Wrong format";

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const parsedMM = parseInt(MM);
  const parsedYYYY = parseInt(YYYY);
  if (parsedMM > 12 || parsedMM < 0) return "Wrong month";
  if (parsedYYYY === currentYear && parsedMM < currentMonth)
    return "Wrong month";
  if (parsedYYYY < currentYear) return "Wrong year";

  return null;
};

const Home: NextPage = () => {
  const [isValid, setValid] = useState(false);
  const form = useForm<PaymentFields>({
    initialValues: {
      cardNumber: "",
      expirationDate: "",
      cvv: "",
      amount: "",
    },
    validate: (values) => ({
      cardNumber:
        values.cardNumber.length < 16 ? "Too short card number" : null,
      expirationDate: expirationDateValidate(values.expirationDate),
      cvv: values.cvv.length < 3 ? "Too short CVV" : null,
      amount: values.amount.length === 0 ? "Enter the value, please" : null,
    }),
  });

  useEffect(() => {
    const { hasErrors } = form.validate();
    hasErrors ? setValid(false) : setValid(true);

    form.clearErrors();
  }, [form.values]);

  const handleCardNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.value;

    if (!isValidValue(value.slice(-1)) && value.length !== 0) return;

    if (value.length === 18) {
      form.setFieldValue("cardNumber", value.split(" ").join(""));
    }
    if (value.length > 16) return;
    if (value.length === 16) {
      const firstPart = value.slice(0, 4);
      const secondPart = value.slice(4, 8);
      const thirdPart = value.slice(8, 12);
      const fourthPart = value.slice(12, 16);
      form.setFieldValue(
        "cardNumber",
        `${firstPart} ${secondPart} ${thirdPart} ${fourthPart}`
      );
      return;
    }

    form.setFieldValue("cardNumber", value);
  };

  const handleExpirationDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.value;

    if (!isValidValue(value.slice(-1)) && value.length !== 0) return;

    let prettierValue = "";

    if (value.length >= 8) return;
    if (value.length === 7 && value[2] !== "/") {
      return;
    }

    if (value.length === 7) {
      prettierValue = value.slice(0, 2) + "/" + value.slice(3, 7);
      form.setFieldValue("expirationDate", prettierValue);
      return;
    }

    if (value.length === 2) {
      prettierValue = value + "/";
    } else {
      prettierValue = value;
    }

    form.setFieldValue("expirationDate", prettierValue);
  };

  const handleExpirationDateKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const expirationDate = form.values.expirationDate;
    if (event.code === "Backspace" && expirationDate.length === 3) {
      form.setFieldValue("expirationDate", expirationDate.split("/")[0]);
    }
  };

  const handleCvvChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    if (!isValidValue(value.slice(-1)) && value.length !== 0) return;
    if (value.length > 3) return;

    form.setFieldValue("cvv", value);
  };

  const handleAmountChange = (
    event: React.SyntheticEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.value;

    if (value.length === 0) {
      form.setFieldValue("amount", "");
      return;
    }

    if (value.split(".")[1]?.length > 2) return;
    if (value.split(".").length > 2) return;

    const prettyValue = parseFloat(event.currentTarget.value);

    if (prettyValue > 10 ** 12) return;

    if (Number.isNaN(prettyValue)) {
      return;
    }

    if (value.slice(-1) === ".") {
      form.setFieldValue("amount", value);
      return;
    }

    form.setFieldValue("amount", String(prettyValue));
  };

  const handleSubmit = async (formValues: PaymentFields) => {
    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formValues,
          cardNumber: formValues.cardNumber.split(" ").join(""),
        }),
      });

      if (!response.ok) {
        throw new Error("Somthing went wrong...");
      }

      showNotification({
        title: "Success!",
        message: "Payment was successful",
        color: "green",
      });
    } catch (error) {
      showNotification({
        title: "Ooops",
        message: String(error),
        color: "red",
      });
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Payment app</title>
      </Head>

      <div className={styles.form}>
        <Card shadow="sm" p="lg">
          <Box sx={{ minWidth: 200, maxWidth: 450 }} mx="auto">
            <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
              <TextInput
                mt="sm"
                label="Card Number"
                placeholder="1234 1234 1234 1234"
                styles={{
                  input: { boxShadow: "4px 4px 8px 0px rgba(34, 60, 80, 0.2)" },
                }}
                {...form.getInputProps("cardNumber")}
                onChange={handleCardNumberChange}
              />
              <div className={styles.about}>
                <TextInput
                  mt="sm"
                  label="Expiration Date"
                  placeholder="MM/YYYY"
                  styles={{
                    input: {
                      boxShadow: "4px 4px 8px 0px rgba(34, 60, 80, 0.2)",
                    },
                  }}
                  {...form.getInputProps("expirationDate")}
                  onChange={handleExpirationDateChange}
                  onKeyDown={handleExpirationDateKeyPress}
                />
                <TextInput
                  mt="sm"
                  label="CVV"
                  placeholder="***"
                  styles={{
                    input: {
                      boxShadow: "4px 4px 8px 0px rgba(34, 60, 80, 0.2)",
                    },
                  }}
                  type="password"
                  {...form.getInputProps("cvv")}
                  onChange={handleCvvChange}
                />
              </div>
              <TextInput
                mt="sm"
                label="Amount"
                placeholder="50.00"
                styles={{
                  input: { boxShadow: "4px 4px 8px 0px rgba(34, 60, 80, 0.2)" },
                }}
                {...form.getInputProps("amount")}
                onChange={handleAmountChange}
              />

              <Group position="right" mt="md">
                <GradientButton isValid={isValid} />
              </Group>
            </form>
          </Box>
        </Card>
      </div>
    </div>
  );
};

export default Home;
