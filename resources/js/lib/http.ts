function readCookie(name: string): string | null {
    const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`));

    return match
        ? decodeURIComponent(match.split('=').slice(1).join('='))
        : null;
}

export async function postForm<T>(url: string, formData: FormData): Promise<T> {
    const token = readCookie('XSRF-TOKEN');

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            ...(token ? { 'X-XSRF-TOKEN': token } : {}),
        },
        body: formData,
    });

    const data = (await response.json()) as T;

    if (!response.ok) {
        throw Object.assign(new Error('Request failed'), {
            data,
            status: response.status,
        });
    }

    return data;
}
