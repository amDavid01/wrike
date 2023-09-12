import {
  LoadingSpinner,
  useDeskproAppEvents,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLinkTasks, useTicketCount } from "../hooks/hooks";
import { FieldMapping } from "../components/FieldMapping/FieldMapping";
import TaskJson from "../mappings/task.json";
import { Stack } from "@deskpro/deskpro-ui";
import { getTasksByIds } from "../api/api";

export const Main = () => {
  const { context } = useDeskproLatestAppContext();
  const navigate = useNavigate();
  const [tasksIds, setTaskIds] = useState<string[]>([]);
  const [taskLinketCount, setTaskLinkedCount] = useState<
    Record<string, number>
  >({});
  const { getLinkedTasks } = useLinkTasks();
  const { getMultipleTasksTicketCount } = useTicketCount();

  useInitialisedDeskproAppClient((client) => {
    client.setTitle("Wrike");

    client.deregisterElement("homeButton");

    client.deregisterElement("menuButton");

    client.registerElement("plusButton", {
      type: "plus_button",
    });

    client.deregisterElement("editButton");

    client.registerElement("refreshButton", {
      type: "refresh_button",
    });
  }, []);

  useInitialisedDeskproAppClient(
    (client) => {
      client.setBadgeCount(tasksIds.length);
    },
    [tasksIds]
  );

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "plusButton":
          navigate("/findOrCreate");
          break;
      }
    },
  });
  const tasksByIdsQuery = useQueryWithClient(
    ["getTasksById"],
    (client) => getTasksByIds(client, tasksIds),
    {
      enabled: !!tasksIds.length,
    }
  );

  useEffect(() => {
    if (!tasksByIdsQuery.error) return;
  }, [tasksByIdsQuery.error]);

  useInitialisedDeskproAppClient(() => {
    (async () => {
      if (!context) return;

      const linkedTasks = await getLinkedTasks();

      if (!linkedTasks || linkedTasks.length === 0) {
        navigate("/findOrCreate");

        return;
      }

      setTaskIds(linkedTasks as string[]);

      const tasksLinkedCount = await getMultipleTasksTicketCount(linkedTasks);

      setTaskLinkedCount(tasksLinkedCount);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  if (!tasksByIdsQuery.isSuccess || !taskLinketCount) return <LoadingSpinner />;

  const tasks = tasksByIdsQuery.data.data;

  return (
    <Stack vertical style={{ width: "100%" }}>
      <FieldMapping
        fields={tasks.map((e) => ({
          ...e,
          linked_tickets: taskLinketCount[e.id] || 0,
        }))}
        metadata={TaskJson.link}
        idKey={TaskJson.idKey}
        internalChildUrl={`/view/task/`}
        externalChildUrl={TaskJson.externalUrl}
        childTitleAccessor={(e) => e.title}
      />
    </Stack>
  );
};
