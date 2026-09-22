import { styled } from '@mui/material';
import {
	RichTreeView,
	TreeItem,
	treeItemClasses,
	TreeItemLabel,
	type RichTreeViewProps
} from '@mui/x-tree-view';

type TreeProps = RichTreeViewProps<AnyObject, boolean> & {
	showLine?: boolean;
};

export const Tree = styled(({ showLine, ...props }: TreeProps) => (
	<RichTreeView
		{...props}
		expansionTrigger='iconContainer'
		itemChildrenIndentation={showLine ? 0 : '12px'}
		slots={{
			item(itemProps) {
				return (
					<TreeItem
						{...itemProps}
						sx={{
							...(showLine && {
								[`& .${treeItemClasses.groupTransition}`]: {
									marginLeft: '15px',
									paddingLeft: '15px',
									borderLeft: '1px solid',
									borderColor: 'border.main'
								}
							})
						}}
						slots={{
							label(labelProps) {
								return <TreeItemLabel {...labelProps} sx={{ fontSize: 14 }} />;
							}
						}}
						slotProps={{
							iconContainer: {}
						}}
					/>
				);
			}
		}}
	/>
))(() => ({}));
