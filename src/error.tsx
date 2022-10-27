import { ErrorObject } from '@/components';

const RenderError = (error: ErrorObject) => {
  console.error(error);
	return <span>Render Error</span>;
};

export default RenderError;
