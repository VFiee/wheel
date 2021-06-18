const cookieConvert = {
	decode: text => decodeURIComponent(text),
	encode: text => encodeURIComponent(text)
};
class Cookie {
	constructor({ props, convert } = {}) {
		this.TWENTY_FOUR_HOURS = 864e5;
		this.props = props || { path: "/" };
		this.convert = convert || cookieConvert;
	}
	/**
	 * 读取Cookie并返回对象
	 * @returns {CookiePair|null}
	 *
	 */
	getCookiePair() {
		const cookies = document.cookie
			? this.convert.decode(document.cookie).split("; ")
			: [];
		if (cookies.length <= 0) return null;
		return cookies.reduce((res, cookie) => {
			const [key, value] = cookie.split("=");
			if (!res[key]) {
				res[this.convert.decode(key)] = this.convert.decode(value);
			}
			return res;
		}, {});
	}
	/**
	 * 获取Cookie,如果有则返回,没有返回null
	 * @param {string} key
	 * @returns {string|null}
	 */
	getItem(key) {
		const cookiePair = this.getCookiePair();
		if (!key || cookiePair == null) return null;
		return cookiePair[this.convert.decode(key)];
	}
	/**
	 * 设置Cookie,
	 * @param {string} key cookie名称
	 * @param {string} value cookie值
	 * @param {CookieProps} props cookie设置参数
	 * @returns {string} 返回document.cookie
	 */
	setItem(key, value, props = this.props) {
		props = Object.assign(Object.assign({}, this.props), props);
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
	removeItem(key, props = this.props) {
		if (this.has(key)) {
			return !!this.setItem(
				key,
				"",
				Object.assign(Object.assign({}, props), {
					expires: "Thu, 01 Jan 1970 00:00:00 GMT"
				})
			);
		}
		return false;
	}
	/**
	 * 查找[cookie]中是否存在指定[key]
	 * @param {string} key
	 * @returns {boolean} 存在则返回true,否则返回false
	 */
	has(key) {
		const cookiePair = this.getCookiePair();
		return !!(cookiePair && cookiePair[this.convert.decode(key)]);
	}
	/**
	 * 获取[cookie]的keys
	 * @returns {string[]} 返回cookie的key组成的数组
	 */
	keys() {
		const cookiePair = this.getCookiePair();
		return cookiePair == null ? [] : Object.keys(cookiePair);
	}
}
export default new Cookie();
