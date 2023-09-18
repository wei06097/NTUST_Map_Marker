const remote = {
    URL : "http://127.0.0.1:50000",
    getNodes : async () => {
        const response = await fetch(`${remote.URL}/nodes`)
        const nodes = await response.json()
        return Promise.resolve(nodes)
    },
    addNodes : async (payload) => {
        const response = await fetch(`${remote.URL}/node`, {
            method : "POST",
            headers: { "Content-Type": "application/json" },
            body : JSON.stringify(payload)
        })
        const nodes = await response.json()
        return Promise.resolve(nodes)
    }
}

export default remote
