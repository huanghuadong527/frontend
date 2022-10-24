import { SY_CONFIG } from '@/core';

const Swagger = () => {
	return (
		<iframe
			width='100%'
			height='100%'
			frameBorder='false'
			src={`${SY_CONFIG.proxy}/doc.html`}
		/>
	);
};

export default Swagger;
