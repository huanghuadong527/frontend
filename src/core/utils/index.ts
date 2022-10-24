/**
 * 导出文件
 * @param blob 文件流 fileName 文件名
 */
const exportFile = (blob: Blob, fileName: string) => {
	const href = window.URL.createObjectURL(blob);
	const downloadElement = document.createElement('a');
	downloadElement.href = href;
	downloadElement.download = fileName;
	document.body.appendChild(downloadElement);
	downloadElement.click();
	document.body.removeChild(downloadElement);
	window.URL.revokeObjectURL(href);
};

export { exportFile };
