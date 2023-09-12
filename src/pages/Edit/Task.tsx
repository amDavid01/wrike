import { useParams } from "react-router-dom";
import { MutateTask } from "../../components/Mutate/Task";

export const EditTask = () => {
  const { taskId } = useParams();

  if (!taskId) return <div />;

  return <MutateTask id={taskId} />;
};
