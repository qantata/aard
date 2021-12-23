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
import { Divider } from "../../components/Divider";
import { Table } from "../../components/Table";
import { styled } from "../../stitches.config";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
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

const Container = styled("div");

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
      <ContentPageHeader>
        <ContentPageHeaderTitles>
          <ContentPageTitle>Libraries</ContentPageTitle>
          <ContentPageSubtitle>View and manage all your libraries</ContentPageSubtitle>
        </ContentPageHeaderTitles>

        <ContentPageHeaderActions>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus size={14} />
                Add library
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new library</DialogTitle>

                <DialogClose asChild>
                  <DialogCloseButton>
                    <Cross1Icon />
                  </DialogCloseButton>
                </DialogClose>
              </DialogHeader>

              <Divider />

              <Input type="text" label="Library root" />

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

export default Libraries;
