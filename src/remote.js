const BASE_URL = "http://127.0.0.1:50000"
const remote = {
    getNodes : async () => {
        const response = await fetch(`${BASE_URL}/nodes`)
        const nodes = await response.json()
        return Promise.resolve(nodes)
    },
    addNode : async (payload) => {
        const response = await fetch(`${BASE_URL}/node`, {
            method : "POST",
            headers: { "Content-Type": "application/json" },
            body : JSON.stringify(payload)
        })
        const nodes = await response.json()
        return Promise.resolve(nodes)
    },
    deleteNode : async (payload) => {
        const response = await fetch(`${BASE_URL}/node`, {
            method : "DELETE",
            headers: { "Content-Type": "application/json" },
            body : JSON.stringify(payload)
        })
        const nodes = await response.json()
        return Promise.resolve(nodes)
    },
    editNeighbors : async (payload) => {
        const response = await fetch(`${BASE_URL}/node`, {
            method : "PUT",
            headers: { "Content-Type": "application/json" },
            body : JSON.stringify(payload)
        })
        const nodes = await response.json()
        return Promise.resolve(nodes)
    }
}

export default remote
