import { useRef, useState } from 'react';
import { Modal, ModalProps } from 'antd';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

interface ModalDraggableType extends ModalProps {
	visible: boolean;
	children: string | JSX.Element;
}

const defaultBounds = { left: 0, top: 0, bottom: 0, right: 0 };

const ModalDraggable = (props: ModalDraggableType) => {
	const draggleRef = useRef<HTMLDivElement>(null);

	const [disabled, setDisabled] = useState(false);
	const [bounds, setBounds] = useState(defaultBounds);

	const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
		const { clientWidth, clientHeight } = window.document.documentElement;
		const targetRect = draggleRef.current?.getBoundingClientRect();
		if (!targetRect) {
			return;
		}
		setBounds({
			left: -targetRect.left + uiData.x,
			right: clientWidth - (targetRect.right - uiData.x),
			top: -targetRect.top + uiData.y,
			bottom: clientHeight - (targetRect.bottom - uiData.y),
		});
	};

	return (
		<Modal
			{...props}
			title={
				<div
					className='mes-modal-draggable--title'
					onMouseOver={() => {
						if (disabled) {
							setDisabled(false);
						}
					}}
					onMouseOut={() => {
						setDisabled(true);
					}}
					onFocus={() => {}}
					onBlur={() => {}}
				>
					{props.title}
				</div>
			}
			modalRender={(modal) => (
				<Draggable
					disabled={disabled}
					bounds={bounds}
					onStart={(event, uiData) => onStart(event, uiData)}
				>
					<div ref={draggleRef}>{modal}</div>
				</Draggable>
			)}
		>
			{props.children}
		</Modal>
	);
};

export { ModalDraggable };
