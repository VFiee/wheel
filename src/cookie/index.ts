/**
 *  开始敲代码之前,先看一下cookie的格式
 *
 *  打开MDN: https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie
 *  打开控制台,输入: document.cookie(get)
 *  输出: "preferredlocale=zh-CN; lux_uid=162384192899561728"
 *
 *  那么如何写入cookie呢?
 *  document.cookie = "key=value; key2=value2; ..."
 *
 *
 *
 */

interface CookiePair {
	[key: string]: string;
}

interface CookieProps {
	path?: string;
	expires?: number | string | Date;
	domain?: string;
	secure?: boolean;
}

interface CookieConvert {
	decode: (text: string) => string;
	encode: (text: string) => string;
}

interface CookieConfig {
	props?: CookieProps;
	convert?: CookieConvert;
}

const cookieConvert: CookieConvert = {
	decode: (text: string) => decodeURIComponent(text),
	encode: (text: string) => encodeURIComponent(text)
};

class Cookie {
	public TWENTY_FOUR_HOURS = 864e5;
	public props: CookieProps;
	public convert: CookieConvert;
	constructor({ props, convert }: CookieConfig = {}) {
		this.props = props || { path: "/" };
		this.convert = convert || cookieConvert;
	}
	/**
	 * 读取Cookie并返回对象
	 * @returns {CookiePair|null}
	 *
	 */
	private getCookiePair(): CookiePair | null {
		const cookies = document.cookie
			? this.convert.decode(document.cookie).split("; ")
			: [];
		if (cookies.length <= 0) return null;
		return cookies.reduce((res, cookie) => {
			const [key, value] = cookie.split("=");
			if (!res[key] && value) {
				res[key] = value;
			}
			return res;
		}, {});
	}
	/**
	 * 获取Cookie,如果有则返回,没有返回null
	 * @param {string} key
	 * @returns {string|null}
	 */
	getItem(key: string): string | null {
		const cookiePair = this.getCookiePair();
		if (!key || cookiePair == null) return null;
		return cookiePair[key];
	}
	/**
	 * 设置Cookie,
	 * @param {string} key cookie名称
	 * @param {string} value cookie值
	 * @param {CookieProps} props cookie设置参数
	 * @returns {string} 返回document.cookie
	 */
	setItem(key: string, value: string, props: CookieProps = this.props): string {
		props = { ...this.props, ...props };
		if (props.expires) {
			const expires = props.expires;
			if (typeof expires === "number") {
				if (expires === Infinity) {
					props.expires = "Fri, 31 Dec 9999 23:59:59 GMT";
				} else {
					// 天
					props.expires = new Date(
						Date.now() + expires * this.TWENTY_FOUR_HOURS
					).toUTCString();
				}
			} else if (expires instanceof Date) {
				props.expires = expires.toUTCString();
			}
		}
		const propsStr = Object.entries(props).reduce((res, [key, value]) => {
			if (!value) return res;
			res += `; ${key}=${value}`;
			return res;
		}, "");
		return (document.cookie = `${this.convert.encode(
			key
		)}=${this.convert.encode(value)}${propsStr}`);
	}
	/**
	 * 移除cookie中指定的[key]
	 * @param {string} key 移除的[cookie] [name]
	 * @param {Omit<CookieProps, "secure" | "expires">} props 只能指定[path]和[domain]
	 * @returns 如果key不存在,返回false,否则返回true
	 */
	removeItem(
		key: string,
		props: Omit<CookieProps, "secure" | "expires"> = this.props
	): boolean {
		if (this.has(this.convert.decode(key))) {
			return !!this.setItem(key, "", {
				...props,
				expires: -1
			});
		}
		return false;
	}
	/**
	 * 查找[cookie]中是否存在指定[key]
	 * @param {string} key
	 * @returns {boolean} 存在则返回true,否则返回false
	 */
	has(key: string): boolean {
		return !!this.getCookiePair()[this.convert.decode(key)];
	}
	/**
	 * 获取[cookie]的keys
	 * @returns {string[]} 返回cookie的key组成的数组
	 */
	keys(): string[] {
		const cookiePair = this.getCookiePair();
		return cookiePair == null ? [] : Object.keys(cookiePair);
	}
}

export default new Cookie();
