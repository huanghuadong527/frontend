type AnyObject = Record<PropertyKey, any>;

interface Result<T = any> {
	code: number;
	msg: string;
	message: string;
	data: T;
}
