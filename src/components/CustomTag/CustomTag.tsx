import { useDeskproAppTheme } from "@deskpro/app-sdk";
import { RoundedLabelTag } from "@deskpro/deskpro-ui";
import { makeFirstLetterUppercase } from "../../utils/utils";

type Props = {
  title: string | number;
  color: string;
};

export const CustomTag = ({ title, color }: Props) => {
  title = makeFirstLetterUppercase(title as string);
  const { theme } = useDeskproAppTheme();

  switch (color) {
    case "Orange": {
      color = theme?.colors?.orange100;

      break;
    }

    case "Yellow": {
      color = theme.colors.yellow100;

      break;
    }

    case "Red": {
      color = theme?.colors?.red100;

      break;
    }

    case "Green": {
      color = theme?.colors?.green100;

      break;
    }

    default:
      color = theme?.colors?.grey100;
  }

  return (
    <RoundedLabelTag
      label={title as string}
      backgroundColor={color}
      textColor="white"
    />
  );
};
