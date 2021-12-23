import { Cell, Column, Row, TableBody, TableHeader } from "@react-stately/table";
import { Cross1Icon } from "@radix-ui/react-icons";
import { Plus } from "lucide-react";

import {
  ContentPageHeader,
  ContentPageHeaderActions,
  ContentPageHeaderTitles,
  ContentPageSubtitle,
  ContentPageTitle,
} from "../../components/ContentPage";
import { Button } from "../../components/Button";
import { Divider } from "../../components/Divider";
import { Table } from "../../components/Table";
import { styled } from "../../stitches.config";
import {
  Dialog,
  DialogCancelButton,
  DialogClose,
  DialogCloseButton,
  DialogConfirmButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/Dialog";
import { Input } from "../../components/Input";
import { Checkbox } from "../../components/Checkbox";

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
      <ContentPageHeader>
        <ContentPageHeaderTitles>
          <ContentPageTitle>Users</ContentPageTitle>
          <ContentPageSubtitle>View and manage user accounts</ContentPageSubtitle>
        </ContentPageHeaderTitles>

        <ContentPageHeaderActions>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus size={14} />
                Add user
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new user</DialogTitle>

                <DialogClose asChild>
                  <DialogCloseButton>
                    <Cross1Icon />
                  </DialogCloseButton>
                </DialogClose>
              </DialogHeader>

              <Divider />

              <Input type="text" label="Username" />

              <Checkbox>Create this account as an admin account</Checkbox>

              <DialogFooter>
                <DialogClose asChild>
                  <DialogCancelButton>Cancel</DialogCancelButton>
                </DialogClose>

                <DialogClose asChild>
                  <DialogConfirmButton>Create</DialogConfirmButton>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ContentPageHeaderActions>
      </ContentPageHeader>

      <Divider />

      <Table selectionMode="multiple" aria-label="Libraries">
        <TableHeader columns={columns}>{(column) => <Column>{column.name}</Column>}</TableHeader>
        <TableBody items={rows}>{(item) => <Row>{(columnKey) => <Cell>{item[columnKey]}</Cell>}</Row>}</TableBody>
      </Table>
    </Container>
  );
};

export default Users;
