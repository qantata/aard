import { Cell, Column, Row, TableBody, TableHeader } from "@react-stately/table";

import { ContentPageTitle } from "../../components/ContentPage";
import { Divider } from "../../components/Divider";
import { SettingsSubtitle } from "../../components/SettingsSubtitle";
import { Table } from "../../components/Table";
import { styled } from "../../stitches.config";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

const Container = styled("div");

const AddNewLibraryButtonContainer = styled("div", {
  marginTop: "12px",
});

const Libraries = () => {
  let columns = [
    { name: "Type", key: "type" },
    { name: "Root", key: "root" },
    { name: "Size", key: "items" },
  ];

  let rows: any[] = [
    { id: 1, type: "Videos", root: "/path/to/Videos", items: "102" },
    { id: 2, type: "Videos", root: "/another/path/to/videos", items: "4" },
  ];

  return (
    <Container>
      <ContentPageTitle>Library Management</ContentPageTitle>

      <Divider />

      <SettingsSubtitle>All libraries</SettingsSubtitle>

      <Table selectionMode="multiple" aria-label="Libraries">
        <TableHeader columns={columns}>{(column) => <Column>{column.name}</Column>}</TableHeader>
        <TableBody items={rows}>{(item) => <Row>{(columnKey) => <Cell>{item[columnKey]}</Cell>}</Row>}</TableBody>
      </Table>

      <Divider />

      <SettingsSubtitle>Add new library</SettingsSubtitle>
      <Input type="text" label="Library path" />

      <AddNewLibraryButtonContainer>
        <Button>Add</Button>
      </AddNewLibraryButtonContainer>
    </Container>
  );
};

export default Libraries;
