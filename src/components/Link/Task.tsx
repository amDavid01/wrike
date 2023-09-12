// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import {
  useDeskproAppEvents,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { AnyIcon, Button, Checkbox, Input, Stack } from "@deskpro/deskpro-ui";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/debounce";
import { useLinkTasks, useTicketCount } from "../../hooks/hooks";
import TaskJson from "../../mappings/task.json";
import { Title } from "../../styles";
import { FieldMapping } from "../FieldMapping/FieldMapping";
import { HorizontalDivider } from "../HorizontalDivider/HorizontalDivider";
import { LoadingSpinnerCenter } from "../LoadingSpinnerCenter/LoadingSpinnerCenter";
import { getTasksByPrompt } from "../../api/api";

export const LinkTask = () => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [linkedTasks, setLinkedTasks] = useState<string[]>([]);
  const [taskLinketCount, setTaskLinkedCount] = useState<
    Record<string, number>
  >({});
  const [prompt, setPrompt] = useState<string>("");
  const { getLinkedTasks, linkTasks } = useLinkTasks();
  const { getMultipleTasksTicketCount } = useTicketCount();
  const navigate = useNavigate();

  const { debouncedValue: debouncedText } = useDebounce(prompt, 300);

  useInitialisedDeskproAppClient((client) => {
    client.setTitle("Link Task");

    client.registerElement("homeButton", {
      type: "home_button",
    });

    client.deregisterElement("plusButton");
  }, []);

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");
      }
    },
  });

  const tasksQuery = useQueryWithClient(
    ["getTasks", debouncedText],
    (client) => getTasksByPrompt(client, debouncedText),
    {
      enabled: debouncedText.length > 2,
      onSuccess: async (data) => {
        const linkedTasksFunc = await getLinkedTasks();

        if (!linkedTasksFunc) return;

        const linkedTasksIds = data.data
          .filter((task) => linkedTasksFunc.includes(task.id))
          .map((e) => e.id);

        const linkedTaskTickets = await getMultipleTasksTicketCount(
          linkedTasksIds
        );

        setLinkedTasks([...linkedTasks, ...linkedTasksIds]);

        setTaskLinkedCount({
          ...taskLinketCount,
          ...linkedTaskTickets,
        });
      },
    }
  );

  const tasks = tasksQuery.data?.data;

  return (
    <Stack gap={10} style={{ width: "100%" }} vertical>
      <Stack vertical gap={6} style={{ width: "100%" }}>
        <Input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          placeholder="Enter Task Title"
          type="text"
          leftIcon={faMagnifyingGlass as AnyIcon}
        />
        <Stack vertical style={{ width: "100%" }} gap={5}>
          <Stack
            style={{ width: "100%", justifyContent: "space-between" }}
            gap={5}
          >
            <Button
              onClick={() => linkTasks(selectedTasks)}
              disabled={selectedTasks.length === 0}
              text="Link Issue"
            ></Button>
            <Button
              disabled={selectedTasks.length === 0}
              text="Cancel"
              intent="secondary"
              onClick={() => setSelectedTasks([])}
            ></Button>
          </Stack>
          <HorizontalDivider full />
        </Stack>
        {tasksQuery.isFetching ? (
          <LoadingSpinnerCenter />
        ) : tasksQuery.isSuccess &&
          Array.isArray(tasks) &&
          tasks?.length !== 0 ? (
          <Stack vertical gap={5} style={{ width: "100%" }}>
            {tasks?.map((task, i) => {
              return (
                <Stack key={i} gap={6} style={{ width: "100%" }}>
                  <Stack style={{ marginTop: "2px" }}>
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => {
                        if (selectedTasks.includes(task.id)) {
                          setSelectedTasks(
                            selectedTasks.filter((e) => e !== task.id)
                          );
                        } else {
                          setSelectedTasks([...selectedTasks, task.id]);
                        }
                      }}
                    ></Checkbox>
                  </Stack>
                  <Stack style={{ width: "92%" }}>
                    <FieldMapping
                      fields={[
                        {
                          ...task,
                          linked_tickets: taskLinketCount[task.id] || 0,
                        },
                      ]}
                      hasCheckbox={true}
                      metadata={TaskJson.link}
                      idKey={TaskJson.idKey}
                      internalChildUrl={`/view/task/`}
                      externalChildUrl={TaskJson.externalUrl}
                      childTitleAccessor={(e) => e.title}
                    />
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        ) : (
          tasksQuery.isSuccess && <Title>No Tasks Found.</Title>
        )}
      </Stack>
    </Stack>
  );
};
