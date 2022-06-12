import fetch from "node-fetch";


export async function login(username, password) {

    const response = await fetch("https://api.zaptec.com/oauth/token", {
        method: "POST",
        body: `grant_type=password&username=${username}&password=${password}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Accept: "application/json",
        },
    });

    const data = await response.json();

    if (response.status !== 200) {
        console.error(data);

        throw new Error("Access denied");
    }

    return data;
}

/*
public function getChargers(): array
{
    return $this->systemCache->get('_zaptec.chargers.v4', function (CacheItemInterface $item) {
    $item->expiresAfter(3600);

    $response = $this->zaptecClient->request('GET', '/api/chargers', ['headers' => ['Authorization' => 'Bearer '.$this->getToken()]]);

    $chargers = $response->toArray(true);
    $res = [];
    foreach ($chargers['Data'] as $c) {
        $res[] = Charger::fromArray($c);
    }

    return $res;
});
}
 */
export async function getChargers(token) {
    const response = await fetch("https://api.zaptec.com/api/chargers", {
        headers: {"Authorization":`Bearer ${token}`}
    })

    let chargers = await response.json();
    return chargers.Data
}
