
export function shortHashUrl(url: string): string {
	const prime = 1000000007;
	let hash = 0;
	for (let i = 0; i < url.length; i++) {
		hash = (hash * 31 + url.charCodeAt(i)) % prime;
	}

	return hash.toString(36);
}
