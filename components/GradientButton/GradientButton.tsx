import { Button } from "@mantine/core";

import styles from "./GradientButton.module.css";

interface GradientButtonProps {
  isValid: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({ isValid }) => {
  return isValid ? (
    <Button
      type="submit"
      classNames={{
        root: styles.button,
      }}
    >
      <span>Submit</span>
    </Button>
  ) : (
    <Button disabled={true} type="submit">
      Submit
    </Button>
  );
};

export default GradientButton;
