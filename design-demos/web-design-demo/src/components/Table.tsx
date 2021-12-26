import { useRef } from "react";
import { TableState, useTableState } from "@react-stately/table";
import {
  useTable,
  useTableCell,
  useTableColumnHeader,
  useTableHeaderRow,
  useTableRow,
  useTableRowGroup,
  useTableSelectAllCheckbox,
  useTableSelectionCheckbox,
} from "@react-aria/table";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { useCheckbox } from "@react-aria/checkbox";
import { useToggleState } from "@react-stately/toggle";
import { Node } from "@react-types/shared";
import { mergeProps } from "@react-aria/utils";
import { useFocusRing } from "@react-aria/focus";

import { styled } from "../stitches.config";
import { StyledFocus } from "./Focus";

export const TableHeader: React.FC = ({ children }) => {
  const { rowGroupProps } = useTableRowGroup();

  return <thead {...rowGroupProps}>{children}</thead>;
};

type TableHeaderRowProps = {
  item: Node<object>;
  state: TableState<object>;
};

const StyledTableHeaderRow = styled("tr", {
  borderBottom: "1px solid $grayBorderSubtle",
});

export const TableHeaderRow: React.FC<TableHeaderRowProps> = ({ item, state, children }) => {
  const ref = useRef(null);
  const { rowProps } = useTableHeaderRow({ node: item }, state, ref);

  return (
    <StyledTableHeaderRow {...rowProps} ref={ref}>
      {children}
    </StyledTableHeaderRow>
  );
};

const StyledTableHeader = styled(StyledFocus("th"), {
  padding: "12px 48px 12px 16px",
  textTransform: "uppercase",
  fontFamily: "$500",
  fontSize: "$12",

  "&:first-child": {
    paddingRight: "16px",
    borderTopLeftRadius: "6px",
  },
});

const StyledTableCell = styled(StyledFocus("td"), {
  padding: "16px 48px 16px 16px",
  fontSize: "$14",

  "&:first-child": {
    paddingRight: "16px",
  },
});

type TableColumnStateProps = {
  column: Node<object>;
  state: TableState<object>;
};

export const TableColumnHeader: React.FC<TableColumnStateProps> = ({ column, state }) => {
  let ref = useRef(null);
  let { columnHeaderProps } = useTableColumnHeader({ node: column }, state, ref);
  let { isFocusVisible, focusProps } = useFocusRing();
  let arrowIcon = state.sortDescriptor?.direction === "ascending" ? "▲" : "▼";

  return (
    <StyledTableHeader
      {...mergeProps(columnHeaderProps, focusProps)}
      // @ts-ignore TODO: Should be right type but it complains
      colSpan={column.colspan}
      style={{
        // @ts-ignore
        textAlign: column.colspan > 1 ? "center" : "left",
        cursor: "default",
      }}
      focus={isFocusVisible}
      ref={ref}
    >
      {column.rendered}
      {column.props.allowsSorting && (
        <span
          aria-hidden="true"
          style={{
            padding: "0 2px",
            visibility: state.sortDescriptor?.column === column.key ? "visible" : "hidden",
          }}
        >
          {arrowIcon}
        </span>
      )}
    </StyledTableHeader>
  );
};

const StyledCheckbox = styled("input", {
  width: "12px",
  aspectRatio: "1 / 1",
});

export const TableSelectAllCell: React.FC<TableColumnStateProps> = ({ column, state }) => {
  const ref = useRef(null);
  const isSingleSelectionMode = state.selectionManager.selectionMode === "single";
  const { columnHeaderProps } = useTableColumnHeader({ node: column }, state, ref);

  const { checkboxProps } = useTableSelectAllCheckbox(state);
  const inputRef = useRef(null);
  const { inputProps } = useCheckbox(checkboxProps, useToggleState(checkboxProps), inputRef);

  return (
    <StyledTableHeader {...columnHeaderProps} ref={ref}>
      {state.selectionManager.selectionMode === "single" ? (
        <VisuallyHidden>{inputProps["aria-label"]}</VisuallyHidden>
      ) : (
        <StyledCheckbox {...inputProps} ref={inputRef} />
      )}
    </StyledTableHeader>
  );
};

export const TableBody: React.FC = ({ children }) => {
  const { rowGroupProps } = useTableRowGroup();

  return <tbody {...rowGroupProps}>{children}</tbody>;
};

const StyledTableRow = styled(StyledFocus("tr"), {
  "&:not(:last-child)": {
    borderBottom: "1px solid $grayBorderSubtle",
  },
});

type TableRowProps = {
  item: Node<object>;
  state: TableState<object>;
};

export const TableRow: React.FC<TableRowProps> = ({ item, state, children }) => {
  let ref = useRef(null);
  let isSelected = state.selectionManager.isSelected(item.key);
  let { rowProps, isPressed } = useTableRow(
    {
      node: item,
    },
    state,
    ref
  );
  let { isFocusVisible, focusProps } = useFocusRing();

  return (
    <StyledTableRow
      style={{
        background: isSelected
          ? "blueviolet"
          : isPressed
          ? "var(--spectrum-global-color-gray-400)"
          : // @ts-ignore
          item.index % 2
          ? "var(--spectrum-alias-highlight-hover)"
          : "none",
        color: isSelected ? "white" : "inherit",
      }}
      {...mergeProps(rowProps, focusProps)}
      focus={isFocusVisible}
      ref={ref}
    >
      {children}
    </StyledTableRow>
  );
};

type CellStateProps = {
  cell: Node<object>;
  state: TableState<object>;
};

export const TableCell: React.FC<CellStateProps> = ({ cell, state }) => {
  let ref = useRef(null);
  let { gridCellProps } = useTableCell({ node: cell }, state, ref);
  let { isFocusVisible, focusProps } = useFocusRing();

  return (
    <StyledTableCell
      {...mergeProps(gridCellProps, focusProps)}
      style={{
        cursor: "default",
      }}
      focus={isFocusVisible}
      ref={ref}
    >
      {cell.rendered}
    </StyledTableCell>
  );
};

export const TableCheckboxCell: React.FC<CellStateProps> = ({ cell, state }) => {
  let ref = useRef(null);
  let { gridCellProps } = useTableCell({ node: cell }, state, ref);
  let { checkboxProps } = useTableSelectionCheckbox({ key: cell.parentKey! }, state);

  let inputRef = useRef(null);
  let { inputProps } = useCheckbox(checkboxProps, useToggleState(checkboxProps), inputRef);

  return (
    <StyledTableCell {...gridCellProps} ref={ref}>
      <StyledCheckbox {...inputProps} />
    </StyledTableCell>
  );
};

const StyledTable = styled("table", {
  boxShadow: "0 0 0 1px $colors$grayBorderSubtle",
  borderRadius: "6px",
  borderCollapse: "collapse",
  backgroundColor: "$grayBgSubtle",
  color: "$grayTextPrimary",
});

export const Table = (props: any) => {
  const { selectionMode, selectionBehavior } = props;

  const state = useTableState({
    ...props,
    showSelectionCheckboxes: selectionMode === "multiple" && selectionBehavior !== "replace",
  });

  const ref = useRef(null);
  const { collection } = state;
  const { gridProps } = useTable(props, state, ref);

  return (
    <StyledTable {...gridProps} ref={ref}>
      <TableHeader>
        {collection.headerRows.map((headerRow) => (
          <TableHeaderRow key={headerRow.key} item={headerRow} state={state}>
            {[...headerRow.childNodes].map((column) =>
              column.props.isSelectionCell ? (
                <TableSelectAllCell key={column.key} column={column} state={state} />
              ) : (
                <TableColumnHeader key={column.key} column={column} state={state} />
              )
            )}
          </TableHeaderRow>
        ))}
      </TableHeader>

      <TableBody>
        {[...collection.body.childNodes].map((row) => (
          <TableRow key={row.key} item={row} state={state}>
            {[...row.childNodes].map((cell) =>
              cell.props.isSelectionCell ? (
                <TableCheckboxCell key={cell.key} cell={cell} state={state} />
              ) : (
                <TableCell key={cell.key} cell={cell} state={state} />
              )
            )}
          </TableRow>
        ))}
      </TableBody>
    </StyledTable>
  );
};
