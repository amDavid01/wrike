import {
  LoadingSpinner,
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { Stack } from "@deskpro/deskpro-ui";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCustomFields, getNotesByTaskId, getTaskById } from "../../api/api";
import { FieldMapping } from "../../components/FieldMapping/FieldMapping";
import { Notes } from "../../components/Notes/Notes";
import { useLinkTasks, useTicketCount } from "../../hooks/hooks";
import TaskJson from "../../mappings/task.json";
import { CustomFieldTask, ITask } from "../../api/types";

export const ViewTask = () => {
  const { taskId } = useParams();
  const { unlinkTask } = useLinkTasks();
  const navigate = useNavigate();
  const [task, setTask] = useState<ITask | null>(null);
  const [taskLinkedCount, setTaskLinkedCount] = useState<number>(0);

  const { getTaskTicketCount } = useTicketCount();

  useInitialisedDeskproAppClient((client) => {
    client.setTitle("Wrike");

    client.registerElement("editButton", {
      type: "edit_button",
    });

    client.registerElement("homeButton", {
      type: "home_button",
    });

    client.deregisterElement("plusButton");
  }, []);

  useEffect(() => {
    (async () => {
      const taskLinkedCount = await getTaskTicketCount(taskId as string);

      setTaskLinkedCount(taskLinkedCount as number);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTaskTicketCount, taskId]);

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "menuButton":
          await unlinkTask(taskId as string);

          navigate("/redirect");

          break;

        case "editButton":
          navigate("/edit/task/" + taskId);

          break;

        case "homeButton":
          navigate("/redirect");
      }
    },
  });

  const tasksByIdQuery = useQueryWithClient(
    ["getTaskById", taskId as string],
    (client) => getTaskById(client, taskId as string),
    {
      enabled: !!taskId,
    }
  );

  const notesByTaskIdQuery = useQueryWithClient(
    ["notesByTaskId", taskId as string],
    (client) => getNotesByTaskId(client, taskId as string),
    {
      enabled: !!taskId,
    }
  );

  const customFieldsQuery = useQueryWithClient(
    ["customFields"],
    (client) => getCustomFields(client),
    {
      enabled: !!taskId,
    }
  );

  useEffect(() => {
    if (!customFieldsQuery.isSuccess || !tasksByIdQuery.isSuccess) return;

    const customFields = customFieldsQuery.data.data;

    const task = tasksByIdQuery.data.data[0];

    setTask({
      ...task,
      customFields: task.customFields.map((customFieldTask) => {
        const customFieldMeta = customFields.find(
          (customField) => customField.id === customFieldTask.id
        );
        return {
          title: customFieldMeta?.title,
          label: `${customFieldMeta?.type}_customField`,
          value: customFieldTask.value,
          type: `${customFieldMeta?.type}_customField`,
          settings: customFieldMeta?.settings,
        } as unknown as CustomFieldTask;
      }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customFieldsQuery.isSuccess, tasksByIdQuery.isSuccess]);

  const notes = notesByTaskIdQuery.data?.data;

  if (!task || !notesByTaskIdQuery.isSuccess) return <LoadingSpinner />;

  return (
    <Stack vertical gap={10}>
      <FieldMapping
        fields={[
          {
            ...task,
            linked_tickets: taskLinkedCount || 0,
          },
        ]}
        metadata={TaskJson.view}
        childTitleAccessor={(e) => e.title}
        idKey={TaskJson.idKey}
        externalChildUrl={TaskJson.externalUrl}
      />
      <Notes id={taskId as string} notes={notes}></Notes>
    </Stack>
  );
};
