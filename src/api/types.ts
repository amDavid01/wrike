/* eslint-disable @typescript-eslint/no-explicit-any */
export type RequestMethod = "GET" | "POST" | "PATCH" | "DELETE" | "PUT";

export type IWrikeResponse<T> = {
  kind: string;
  data: T;
};

export interface INote {
  id: string;
  authorId: string;
  text: string;
  updatedDate: string;
  createdDate: string;
  taskId: string;
}

export interface ICustomFields {
  id: string;
  accountId: string;
  title: string;
  type: string;
  spaceId: string;
  sharedIds: any[];
  settings: Settings;
  value?: string;
}

export interface Settings {
  inheritanceType: string;
  decimalPlaces?: number;
  useThousandsSeparator?: boolean;
  currency?: string;
  aggregation?: string;
  readOnly: boolean;
  values?: string[];
  options?: Option[];
  optionColorsEnabled?: boolean;
  allowOtherValues?: boolean;
}

export interface Option {
  value: string;
  color: string;
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  type: string;
  profiles: Profile[];
  avatarUrl: string;
  timezone: string;
  locale: string;
  deleted: boolean;
  me: boolean;
  title: string;
  companyName: string;
  phone: string;
}

export interface Profile {
  accountId: string;
  email: string;
  role: string;
  external: boolean;
  admin: boolean;
  owner: boolean;
}

export interface IFolderFromList {
  id: string;
  title: string;
  childIds: string[];
  scope: string;
}

export interface ITask {
  id: string;
  accountId: string;
  title: string;
  description: string;
  briefDescription: string;
  parentIds: string[];
  superParentIds: any[];
  sharedIds: string[];
  responsibleIds: string[];
  status: string;
  importance: string;
  createdDate: string;
  updatedDate: string;
  dates: Dates;
  scope: string;
  authorIds: string[];
  customStatusId: string;
  hasAttachments: boolean;
  permalink: string;
  priority: string;
  followedByMe: boolean;
  followerIds: string[];
  superTaskIds: any[];
  subTaskIds: any[];
  dependencyIds: string[];
  metadata: any[];
  customFields: CustomFieldTask[];
  customFieldsData?: Record<string, string>;
}

export interface CustomFieldTask {
  id: string;
  value: string;
}

export interface Dates {
  type: string;
  duration: number;
  start: string;
  due: string;
}

export interface ITaskFromList {
  id: string;
  accountId: string;
  title: string;
  status: string;
  importance: string;
  createdDate: string;
  updatedDate: string;
  completedDate: string;
  dates: Dates;
  scope: string;
  customStatusId: string;
  permalink: string;
  priority: string;
}

export interface Dates {
  type: string;
  duration: number;
  start: string;
  due: string;
}
