import { IDeskproClient, proxyFetch } from "@deskpro/app-sdk";
import {
  ICustomFields,
  IFolderFromList,
  ITask,
  ITaskFromList,
  IUser,
  IWrikeResponse,
  RequestMethod,
} from "./types";

export const getCustomFields = async (
  client: IDeskproClient
): Promise<IWrikeResponse<ICustomFields[]>> =>
  installedRequest(client, `api/v4/customfields`, "GET");

export const createNote = async (
  client: IDeskproClient,
  taskId: string,
  comment: string
) =>
  installedRequest(client, `api/v4/tasks/${taskId}/comments`, "POST", {
    text: comment,
  });

export const getNotesByTaskId = async (
  client: IDeskproClient,
  taskId: string
) => installedRequest(client, `api/v4/tasks/${taskId}/comments`, "GET");

export const editTask = async (
  client: IDeskproClient,
  taskId: string,
  data: unknown
) => installedRequest(client, `api/v4/tasks/${taskId}`, "PUT", data);

export const createTask = async (
  client: IDeskproClient,
  folderId: string,
  data: unknown
) => {
  return installedRequest(
    client,
    `api/v4/folders/${folderId}/tasks`,
    "POST",
    data
  );
};

export const getUsersByIds = async (
  client: IDeskproClient,
  ids: string[]
): Promise<IWrikeResponse<IUser[]>> =>
  installedRequest(client, `api/v4/contacts/${ids.join(",")}`, "GET");

export const getUserById = async (
  client: IDeskproClient,
  id: string
): Promise<IWrikeResponse<IUser[]>> =>
  installedRequest(client, `api/v4/contacts/${id}`, "GET");

export const getUsers = async (
  client: IDeskproClient
): Promise<IWrikeResponse<IUser[]>> =>
  installedRequest(client, `api/v4/contacts`, "GET");

export const getTasksByPrompt = async (
  client: IDeskproClient,
  prompt: string
): Promise<IWrikeResponse<ITaskFromList[]>> =>
  installedRequest(
    client,
    `api/v4/tasks?title=${encodeURIComponent(
      prompt
    )}&descendants=true&pageSize=1000`,
    "GET"
  );

export const getTasks = async (
  client: IDeskproClient
): Promise<IWrikeResponse<ITaskFromList[]>> =>
  installedRequest(
    client,
    `api/v4/tasks?descendants=true&pageSize=1000`,
    "GET"
  );

export const getTasksByIds = async (
  client: IDeskproClient,
  ids: string[]
): Promise<IWrikeResponse<ITaskFromList[]>> =>
  installedRequest(client, `api/v4/tasks/${ids.join(",")}`, "GET");

export const getTaskById = async (
  client: IDeskproClient,
  taskId: string
): Promise<IWrikeResponse<ITask[]>> =>
  installedRequest(client, `api/v4/tasks/${taskId}`, "GET");

export const getTasksByFolderId = async (
  client: IDeskproClient,
  folderId: string
): Promise<IWrikeResponse<ITask[]>> =>
  installedRequest(client, `api/v4/folders/${folderId}/tasks`, "GET");

export const getFolders = async (client: IDeskproClient) => {
  const folderData: IWrikeResponse<IFolderFromList[]> = await installedRequest(
    client,
    "api/v4/folders",
    "GET"
  );

  return {
    data: folderData.data.filter((folder) => folder.title !== "Recycle Bin"),
  };
};

const installedRequest = async (
  client: IDeskproClient,
  endpoint: string,
  method: RequestMethod,
  data?: unknown
) => {
  const fetch = await proxyFetch(client);

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "bearer __access_token__",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`https://www.wrike.com/${endpoint}`, options);

  if (isResponseError(response)) {
    throw new Error(
      JSON.stringify({
        status: response.status,
        message: await response.text(),
      })
    );
  }

  const json = await response.json();

  if (json.error) {
    throw new Error(`${json.error} ${json.errorDescription}`);
  }

  return json;
};

export const isResponseError = (response: Response) =>
  response.status < 200 || response.status >= 400;
