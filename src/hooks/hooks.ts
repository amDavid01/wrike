import {
  useDeskproAppClient,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export const useTicketCount = () => {
  const { client } = useDeskproAppClient();

  const getTaskTicketCount = useCallback(
    async (taskId: string) => {
      if (!client) return;

      return (await client.getState(`task/${taskId}`))?.[0]?.data as
        | number
        | undefined;
    },
    [client]
  );

  const getMultipleTasksTicketCount = useCallback(
    async (taskIds: string[] = []) => {
      if (!client) return {};

      const taskObjArr = await Promise.all(
        taskIds.map(async (id) => ({
          [id]: (await getTaskTicketCount(id)) || 0,
        }))
      );

      return taskObjArr.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    },
    [client, getTaskTicketCount]
  );

  const incrementTaskTicketCount = useCallback(
    async (taskId: string) => {
      if (!client) return;

      return await client.setState(
        `task/${taskId}`,
        ((await getTaskTicketCount(taskId)) || 0) + 1
      );
    },
    [client, getTaskTicketCount]
  );

  const decrementTaskTicketCount = useCallback(
    async (taskId: string) => {
      if (!client) return;

      return await client.setState(
        `task/${taskId}`,
        ((await getTaskTicketCount(taskId)) || 1) - 1
      );
    },
    [client, getTaskTicketCount]
  );

  return {
    getTaskTicketCount,
    incrementTaskTicketCount,
    decrementTaskTicketCount,
    getMultipleTasksTicketCount,
  };
};

export const useLinkTasks = () => {
  const { context } = useDeskproLatestAppContext();
  const { client } = useDeskproAppClient();
  const [isLinking, setIsLinking] = useState(false);
  const navigate = useNavigate();

  const { incrementTaskTicketCount, decrementTaskTicketCount } =
    useTicketCount();

  const ticket = context?.data.ticket;

  const linkTasks = useCallback(
    async (tasksIds: string[]) => {
      if (!context || !tasksIds.length || !client || !ticket) return;

      setIsLinking(true);

      await Promise.all(
        (tasksIds || []).map((id) =>
          client?.getEntityAssociation("linkedTasks", ticket?.id).set(id)
        )
      );

      await Promise.all(tasksIds.map((id) => incrementTaskTicketCount(id)));

      navigate("/");

      setIsLinking(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [context, client, ticket, incrementTaskTicketCount]
  );

  const getLinkedTasks = useCallback(async () => {
    if (!client || !ticket) return;

    return await client.getEntityAssociation("linkedTasks", ticket?.id).list();
  }, [client, ticket]);

  const unlinkTask = useCallback(
    async (taskId: string) => {
      if (!client || !ticket) return;

      await client
        .getEntityAssociation("linkedTasks", ticket?.id)
        .delete(taskId);

      await decrementTaskTicketCount(taskId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [client, decrementTaskTicketCount, ticket]
  );
  return {
    linkTasks,
    isLinking,
    getLinkedTasks,
    unlinkTask,
  };
};
