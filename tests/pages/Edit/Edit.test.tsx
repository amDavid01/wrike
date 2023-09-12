import { lightTheme, ThemeProvider } from "@deskpro/deskpro-ui";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react/";
import * as Api from "../../../src/api/api";
import React from "react";
import { MutateTask } from "../../../src/components/Mutate/Task";

const renderPage = () => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <MutateTask id="1" />
    </ThemeProvider>
  );
};

jest.mock("../../../src/api/api", () => {
  return {
    getTaskById: () => ({
      data: [
        {
          parentIds: [1],
          id: "1",
          status: "Active",
          description: "Test Description",
          importance: "High",
          scope: "Test Scope",
          title: "Test Task",
          dates: {
            start: "2021-09-30T00:00:00Z",
            due: "2021-09-30T00:00:00Z",
          },
          linked_tickets: 1,
          customFields: [
            {
              id: "1",
              value: "Test Value",
            },
          ],
        },
      ],
    }),
    getTasks: () => ({
      data: [
        {
          id: "1",
          status: "Active",
          description: "Test Description",
          importance: "High",
          scope: "Test Scope",
          title: "Test Task",
          dates: {
            start: "2021-09-30T00:00:00Z",
            due: "2021-09-30T00:00:00Z",
          },
          linked_tickets: 1,
          customFields: [
            {
              id: "1",
              value: "Test Value",
            },
          ],
        },
      ],
    }),
    getUsers: () => ({
      data: [{ firstName: "David", lastName: "Something", id: 1 }],
    }),
    getCustomFields: () => ({
      data: [
        {
          id: "1",
          title: "Test Custom Field",
          type: "Text",
          settings: {},
        },
      ],
    }),
    editTask: jest.fn(),
  };
});

describe("Edit Page", () => {
  test("Editing a Task should work correctly", async () => {
    const { getByTestId } = renderPage();
    fireEvent(getByTestId("button-submit"), new MouseEvent("click"));

    await waitFor(() => {
      fireEvent(getByTestId("button-submit"), new MouseEvent("click"));

      expect(Api.editTask).toBeCalled();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    cleanup();
  });
});
