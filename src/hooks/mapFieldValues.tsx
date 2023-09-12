import { ReactElement } from "react";
import { ICustomFields, ITask } from "../api/types";
import { CustomTag } from "../components/CustomTag/CustomTag";
import { IJson } from "../types/json";
import { formatDate } from "../utils/dateUtils";
import { getObjectValue, makeFirstLetterUppercase } from "../utils/utils";

type CustomFieldTypeField = Record<
  string,
  { value: string; settings: ICustomFields["settings"] }
>;

export const useMapFieldValues = () => {
  const mapFieldValues = (
    metadataFields: IJson["list"][0] | IJson["view"][0],
    field: ITask | CustomFieldTypeField
  ) => {
    return metadataFields.map((metadataField) => {
      let value: string | number | ReactElement;

      switch (metadataField.type) {
        case "date":
          value = (field as ITask).dates?.[
            metadataField.name as keyof ITask["dates"]
          ]
            ? formatDate(
                new Date(
                  (field as ITask).dates[
                    metadataField.name as keyof ITask["dates"]
                  ] as string
                )
              )
            : "-";

          break;

        case "description":
          value = (field as ITask)[metadataField.name as keyof ITask] ? (
            <div
              dangerouslySetInnerHTML={{
                __html: (
                  (field as ITask)[metadataField.name as keyof ITask] as string
                )?.replaceAll("<a", `<a target="_blank" `),
              }}
            />
          ) : (
            "-"
          );

          break;

        case "key":
          value = getObjectValue(field, metadataField.name);

          break;

        case "text":
          value = makeFirstLetterUppercase(
            (field as ITask)[metadataField.name as keyof ITask] as string
          );

          break;

        case "Currency_customField":
          value = (() => {
            const data = (field as unknown as Record<string, ICustomFields>)[
              metadataField.name as unknown as keyof ICustomFields
            ];

            return new Intl.NumberFormat("en-GB", {
              style: "currency",
              currency: (field as CustomFieldTypeField)[metadataField.name]
                .settings.currency,
            }).format(data.value as unknown as number);
          })();
          break;

        case "Text_customField":
          value = (field as CustomFieldTypeField)[metadataField.name].value;
          break;

        case "DropDown_customField":
          value = (() => {
            const option = (field as CustomFieldTypeField)[
              metadataField.name
            ].settings.options?.find(
              (e: { value: string }) =>
                e.value ===
                (field as CustomFieldTypeField)[metadataField.name].value
            );

            return (
              <CustomTag
                title={
                  (field as CustomFieldTypeField)[metadataField.name].value
                }
                color={option?.color || "Green"}
              ></CustomTag>
            );
          })();

          break;

        case "customFields":
          value = "customFields";

          break;

        default:
          if (metadataField.name in field) {
            value = (field as ITask)[
              metadataField.name as keyof ITask
            ] as string;
          } else {
            value = "-";
          }
      }

      return {
        key: metadataField.label,
        value,
      };
    });
  };

  return { mapFieldValues };
};
