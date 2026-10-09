import {
	useCallback,
	useEffect,
	useRef,
	useState,
	type MouseEvent as ReactMouseEvent,
	type WheelEvent as ReactWheelEvent
} from 'react';
import { createPortal } from 'react-dom';
import { IconButton, Stack } from '@mui/material';
import {
	ArrowDownloadRegular,
	ArrowLeftRegular,
	ArrowRightRegular,
	ArrowRotateClockwiseRegular,
	ArrowRotateCounterclockwiseRegular,
	DismissRegular,
	ZoomInRegular,
	ZoomOutRegular
} from '@fluentui/react-icons';
import { API_UPLOAD } from '@/core';
import { downloadFile } from '@/service';
import { getFileName } from '@/utils';

const BASE_SCALE_RATIO = 1;
const WHEEL_MAX_SCALE_RATIO = 1;
const SCALE_STEP = 0.5;
const MIN_SCALE = 0.1;
const MAX_SCALE = 50;

const getImageUrl = (value: unknown) => {
	const src = String(value);
	return src.startsWith('http') ? src : API_UPLOAD + src;
};

interface Transform {
	x: number;
	y: number;
	scale: number;
	rotate: number;
}

const initialTransform: Transform = { x: 0, y: 0, scale: 1, rotate: 0 };

const toolButtonSx = {
	color: '#fff',
	'&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
	'&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
};

const arrowButtonSx = {
	color: '#fff',
	backgroundColor: 'rgba(255,255,255,0.1)',
	'&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
	'&.Mui-disabled': { color: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.05)' }
};

/** 拖拽越界后回弹到容器边缘（未越界则保持原位，不再强制回中） */
const getFixPosition = (
	width: number,
	height: number,
	left: number,
	top: number
): Partial<Pick<Transform, 'x' | 'y'>> | null => {
	const clientWidth = window.innerWidth;
	const clientHeight = window.innerHeight;

	// 视口坐标换算为 transform 坐标（中心点为原点），并钳制在可见范围内
	const fixAxis = (start: number, size: number, clientSize: number) => {
		const delta = (size - clientSize) / 2;
		const x = start + delta;
		const limit = Math.abs(delta);
		if (x < -limit) return -limit;
		if (x > limit) return limit;
		return null;
	};

	const x = fixAxis(left, width, clientWidth);
	const y = fixAxis(top, height, clientHeight);
	if (x === null && y === null) return null;
	return { ...(x !== null ? { x } : {}), ...(y !== null ? { y } : {}) };
};

interface PreviewProps {
	srcs: string[];
	index: number;
	onClose: () => void;
}

/** 全屏预览遮罩：缩放 / 平移 / 旋转 / 下载 / 切换上一张下一张 */
const Preview = ({ srcs, index, onClose }: PreviewProps) => {
	const imgRef = useRef<HTMLImageElement>(null);
	const transformRef = useRef<Transform>(initialTransform);
	const startRef = useRef({ diffX: 0, diffY: 0, transformX: 0, transformY: 0 });
	const [transform, setTransform] = useState<Transform>(initialTransform);
	const [isMoving, setIsMoving] = useState(false);
	const [current, setCurrent] = useState(index);

	const src = srcs[current];
	const name = srcs[current];

	const onPrev = useCallback(() => {
		setCurrent((c) => Math.max(0, c - 1));
	}, []);

	const onNext = useCallback(() => {
		setCurrent((c) => Math.min(srcs.length - 1, c + 1));
	}, [srcs.length]);

	useEffect(() => {
		transformRef.current = { ...initialTransform };
		setTransform({ ...initialTransform });
	}, [current]);

	const updateTransform = (patch: Partial<Transform>) => {
		transformRef.current = { ...transformRef.current, ...patch };
		setTransform(transformRef.current);
	};

	/** 以 centerX / centerY 为基准缩放，缺省以视口中心为基准 */
	const dispatchZoomChange = (ratio: number, centerX?: number, centerY?: number) => {
		const img = imgRef.current;
		if (!img) return;
		const { x, y, scale } = transformRef.current;
		const width = img.offsetWidth;
		const height = img.offsetHeight;
		const offsetLeft = img.offsetLeft;
		const offsetTop = img.offsetTop;

		let newRatio = ratio;
		let newScale = scale * ratio;
		if (newScale > MAX_SCALE) {
			newScale = MAX_SCALE;
			newRatio = MAX_SCALE / scale;
		} else if (newScale < MIN_SCALE) {
			newScale = MIN_SCALE;
			newRatio = MIN_SCALE / scale;
		}

		const mergedCenterX = centerX ?? window.innerWidth / 2;
		const mergedCenterY = centerY ?? window.innerHeight / 2;
		const diffRatio = newRatio - 1;
		const diffImgX = diffRatio * width * 0.5;
		const diffImgY = diffRatio * height * 0.5;
		const diffOffsetLeft = diffRatio * (mergedCenterX - x - offsetLeft);
		const diffOffsetTop = diffRatio * (mergedCenterY - y - offsetTop);
		let newX = x - (diffOffsetLeft - diffImgX);
		let newY = y - (diffOffsetTop - diffImgY);

		if (ratio < 1 && newScale === 1) {
			const mergedWidth = width * newScale;
			const mergedHeight = height * newScale;
			if (mergedWidth <= window.innerWidth && mergedHeight <= window.innerHeight) {
				newX = 0;
				newY = 0;
			}
		}
		updateTransform({ x: newX, y: newY, scale: newScale });
	};

	const onZoomIn = () => dispatchZoomChange(BASE_SCALE_RATIO + SCALE_STEP);
	const onZoomOut = () => dispatchZoomChange(BASE_SCALE_RATIO / (BASE_SCALE_RATIO + SCALE_STEP));
	const onRotateRight = () => updateTransform({ rotate: transformRef.current.rotate + 90 });
	const onRotateLeft = () => updateTransform({ rotate: transformRef.current.rotate - 90 });

	const onWheel = (e: ReactWheelEvent) => {
		if (e.deltaY === 0) return;
		const scaleRatio = Math.abs(e.deltaY / 100);
		const mergedScaleRatio = Math.min(scaleRatio, WHEEL_MAX_SCALE_RATIO);
		let ratio = BASE_SCALE_RATIO + mergedScaleRatio * SCALE_STEP;
		if (e.deltaY > 0) ratio = BASE_SCALE_RATIO / ratio;
		dispatchZoomChange(ratio, e.clientX, e.clientY);
	};

	const onDoubleClick = (e: ReactMouseEvent) => {
		if (transformRef.current.scale !== 1) {
			updateTransform({ x: 0, y: 0, scale: 1 });
		} else {
			dispatchZoomChange(BASE_SCALE_RATIO + SCALE_STEP, e.clientX, e.clientY);
		}
	};

	const onMouseDown = (e: ReactMouseEvent) => {
		if (e.button !== 0) return;
		e.preventDefault();
		const { x, y } = transformRef.current;
		startRef.current = {
			diffX: e.pageX - x,
			diffY: e.pageY - y,
			transformX: x,
			transformY: y
		};
		setIsMoving(true);
	};

	useEffect(() => {
		if (!isMoving) return;
		const onMouseMove = (e: MouseEvent) => {
			updateTransform({
				x: e.pageX - startRef.current.diffX,
				y: e.pageY - startRef.current.diffY
			});
		};
		const onMouseUp = () => {
			const { x, y, rotate, scale } = transformRef.current;
			const { transformX, transformY } = startRef.current;
			const hasChanged = x !== transformX || y !== transformY;
			setIsMoving(false);
			if (hasChanged && imgRef.current) {
				const img = imgRef.current;
				const width = img.offsetWidth * scale;
				const height = img.offsetHeight * scale;
				const rect = img.getBoundingClientRect();
				const isRotated = rotate % 180 !== 0;
				const fix = getFixPosition(
					isRotated ? height : width,
					isRotated ? width : height,
					rect.left,
					rect.top
				);
				if (fix) {
					requestAnimationFrame(() => updateTransform(fix));
				}
			}
		};
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};
	}, [isMoving]);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
			if (e.key === 'ArrowLeft') onPrev();
			if (e.key === 'ArrowRight') onNext();
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [onClose, onPrev, onNext]);

	useEffect(() => {
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevOverflow;
		};
	}, []);

	const onDownload = () => {
		downloadFile(name)
			.then((result) => {
				const blob = result as unknown as Blob;
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = getFileName(name) || 'image';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			})
			.catch(() => {
				window.open(src, '_blank');
			});
	};

	const { x, y, scale, rotate } = transform;

	return createPortal(
		<>
			<div
				style={{
					position: 'fixed',
					inset: 0,
					background: 'rgba(0, 0, 0, 0.8)',
					zIndex: 1299
				}}
				onClick={onClose}
			/>
			<div
				style={{
					position: 'fixed',
					inset: 0,
					zIndex: 1300,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					pointerEvents: 'none'
				}}
			>
				<img
					ref={imgRef}
					src={src}
					alt='预览大图'
					draggable={false}
					onWheel={onWheel}
					onDoubleClick={onDoubleClick}
					onMouseDown={onMouseDown}
					style={{
						maxWidth: '100%',
						maxHeight: '100%',
						pointerEvents: 'auto',
						userSelect: 'none',
						cursor: isMoving ? 'grabbing' : 'grab',
						transform: `translate3d(${x}px, ${y}px, 0) scale3d(${scale}, ${scale}, 1) rotate(${rotate}deg)`,
						transition: 'transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1) 0s'
					}}
				/>
			</div>
			<div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1301 }}>
				<IconButton
					title='关闭'
					onClick={onClose}
					sx={{
						color: '#fff',
						backgroundColor: 'rgba(255,255,255,0.1)',
						'&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' }
					}}
				>
					<DismissRegular />
				</IconButton>
			</div>
			{srcs.length > 1 ? (
				<>
					<div
						style={{
							position: 'fixed',
							left: 16,
							top: '50%',
							transform: 'translateY(-50%)',
							zIndex: 1301
						}}
					>
						<IconButton
							title='上一张'
							onClick={onPrev}
							disabled={current === 0}
							sx={arrowButtonSx}
						>
							<ArrowLeftRegular />
						</IconButton>
					</div>
					<div
						style={{
							position: 'fixed',
							right: 16,
							top: '50%',
							transform: 'translateY(-50%)',
							zIndex: 1301
						}}
					>
						<IconButton
							title='下一张'
							onClick={onNext}
							disabled={current === srcs.length - 1}
							sx={arrowButtonSx}
						>
							<ArrowRightRegular />
						</IconButton>
					</div>
				</>
			) : null}
			<div
				style={{
					position: 'fixed',
					bottom: 24,
					left: '50%',
					transform: 'translateX(-50%)',
					zIndex: 1301,
					display: 'flex',
					alignItems: 'center',
					gap: 4,
					padding: '4px 8px',
					borderRadius: 8,
					background: 'rgba(0, 0, 0, 0.6)'
				}}
			>
				<IconButton title='缩小' onClick={onZoomOut} disabled={scale <= MIN_SCALE} sx={toolButtonSx}>
					<ZoomOutRegular />
				</IconButton>
				<IconButton title='放大' onClick={onZoomIn} disabled={scale >= MAX_SCALE} sx={toolButtonSx}>
					<ZoomInRegular />
				</IconButton>
				<IconButton title='向左旋转' onClick={onRotateLeft} sx={toolButtonSx}>
					<ArrowRotateCounterclockwiseRegular />
				</IconButton>
				<IconButton title='向右旋转' onClick={onRotateRight} sx={toolButtonSx}>
					<ArrowRotateClockwiseRegular />
				</IconButton>
				<IconButton title='下载' onClick={onDownload} sx={toolButtonSx}>
					<ArrowDownloadRegular />
				</IconButton>
			</div>
		</>,
		document.body
	);
};

interface ImagePreviewProps {
	value: unknown;
	/** 缩略图圆角，头像传 '50%'，普通图片默认 4 */
	borderRadius?: number | string;
	/** 预览图片组，用于切换上一张/下一张 */
	images?: string[];
}

/** 表格缩略图，点击查看大图 */
export const ImagePreview = ({ value, borderRadius = 4, images }: ImagePreviewProps) => {
	const [open, setOpen] = useState(false);

	if (!value) return '--';

	const url = getImageUrl(value);
	const srcs = (images && images.length ? images : [String(value)]).map(getImageUrl);
	const index = Math.max(0, srcs.indexOf(url));

	return (
		<>
			<Stack className='h-full' sx={{ justifyContent: 'center', alignItems: 'center' }}>
				<img
					src={url}
					alt=''
					onClick={() => {
						(document.activeElement as HTMLElement | null)?.blur();
						setOpen(true);
					}}
					style={{
						width: 28,
						height: 28,
						objectFit: 'cover',
						borderRadius,
						cursor: 'pointer'
					}}
				/>
			</Stack>
			{open ? (
				<Preview srcs={srcs} index={index} onClose={() => setOpen(false)} />
			) : null}
		</>
	);
};
