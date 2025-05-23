import { DndContext, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Paper, styled } from '@mui/material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0.5),
  cursor: 'move',
  backgroundColor: theme.palette.background.default,
  textAlign: 'center',
  fontSize: '0.7rem',
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.text.primary,
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    boxShadow: theme.shadows[3],
  },
}));

const SortableItem = ({ id }: { id: UniqueIdentifier }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <StyledPaper ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {id}
    </StyledPaper>
  );
};

const DraggableColumns = ({
  foldArray,
  onOrderChange,
}: {
  foldArray: React.MutableRefObject<UniqueIdentifier[]>
  onOrderChange?: (newOrder: UniqueIdentifier[]) => void
}) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;
    if (active.id !== over?.id) {
      const oldIndex = foldArray.current.indexOf(active.id);
      const newIndex = foldArray.current.indexOf(over.id);
      const newArray = arrayMove(foldArray.current, oldIndex, newIndex);

      foldArray.current = newArray;
      onOrderChange?.(newArray);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={foldArray.current}>
        <div
          style={{
            display: 'flex',
            width: '77%',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'absolute',
            zIndex: 100,
          }}
        >
          {foldArray.current.map(id => (
            <SortableItem key={id} id={id} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableColumns;
