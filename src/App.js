import Marker from "./Marker/Marker"
import Navigation from "./Navigation/Navigation"

function App() {
    const Component = window.location.pathname === "/marker"? Marker: Navigation
    return <>
        <Component />
    </>
}

export default App
