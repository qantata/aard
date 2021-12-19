import { Cell, Column, Row, TableBody, TableHeader } from "@react-stately/table";

import { ContentPageTitle } from "../../components/ContentPage";
import { Divider } from "../../components/Divider";
import { SettingsSubtitle } from "../../components/SettingsSubtitle";
import { Table } from "../../components/Table";
import { styled } from "../../stitches.config";

const Container = styled("div");

const Users = () => {
  let columns = [
    { name: "Username", key: "username" },
    { name: "Role", key: "role" },
  ];

  let rows: any[] = [
    { id: 1, username: "root", role: "Admin" },
    { id: 2, username: "guest", role: "User" },
  ];

  return (
    <Container>
      <ContentPageTitle>User Management</ContentPageTitle>

      <Divider />

      <SettingsSubtitle>All users</SettingsSubtitle>

      <Table selectionMode="multiple" aria-label="Libraries">
        <TableHeader columns={columns}>{(column) => <Column>{column.name}</Column>}</TableHeader>
        <TableBody items={rows}>{(item) => <Row>{(columnKey) => <Cell>{item[columnKey]}</Cell>}</Row>}</TableBody>
      </Table>
    </Container>
  );
};

export default Users;
