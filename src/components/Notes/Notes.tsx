import { formatDateSince } from "../../utils/dateUtils";
import { HorizontalDivider } from "../HorizontalDivider/HorizontalDivider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { Avatar, H1, H2, Stack } from "@deskpro/deskpro-ui";
import styled from "styled-components";
import { INote } from "../../api/types";
import { useQueryWithClient } from "@deskpro/app-sdk";
import { getUsersByIds } from "../../api/api";
import { useMemo } from "react";

type Props = {
  notes: INote[];
  id: string;
};

const HTMLDiv = styled.div`
  & > p {
    margin: 0;
  }
`;

export const Notes = ({ notes, id }: Props) => {
  const navigate = useNavigate();

  const userIdsStr = useMemo(
    () => notes.map((e) => e.authorId).reduce((a, c) => a + c, ""),
    [notes]
  );

  const usersQuery = useQueryWithClient(["users", userIdsStr], (client) =>
    getUsersByIds(
      client,
      notes.map((e) => e.authorId)
    )
  );

  const users = usersQuery.data?.data;

  return (
    <Stack vertical gap={10} style={{ width: "100%" }}>
      <HorizontalDivider full />
      <Stack gap={5}>
        <H1>Updates ({notes.length})</H1>
        <FontAwesomeIcon
          icon={faPlus}
          size="sm"
          style={{
            alignSelf: "center",
            cursor: "pointer",
            marginBottom: "2px",
          }}
          onClick={() => navigate(`/create/note/${id}`)}
        ></FontAwesomeIcon>
      </Stack>
      {notes.map((note, i) => {
        const user = users?.find((e) => e.id === note.authorId);

        return (
          <Stack key={i} vertical gap={5} style={{ width: "100%" }}>
            <Stack
              style={{ alignItems: "flex-start", marginTop: "5px" }}
              gap={5}
            >
              <Stack
                vertical
                gap={3}
                style={{
                  marginLeft: "5px",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Avatar
                  size={22}
                  imageUrl={user?.avatarUrl}
                  name={`${user?.firstName} ${user?.lastName}`}
                ></Avatar>
                <H2 style={{ width: "5ch" }}>
                  {formatDateSince(new Date(note.createdDate)).slice(0, 5)}
                </H2>
              </Stack>
              <HTMLDiv
                dangerouslySetInnerHTML={{
                  __html: note.text.replaceAll("<a", `<a target="_blank" `),
                }}
              />
            </Stack>
            <HorizontalDivider full={i === notes.length - 1} />
          </Stack>
        );
      })}
    </Stack>
  );
};
