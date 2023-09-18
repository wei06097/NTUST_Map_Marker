import NtustMap from "./Components/NtustMap"
import MapBox from "./Components/MapBox"
import { useEffect, useState } from "react"
import remote from "./function/remote"

/* ======================================== */
function App() {
  const [nodes, setNodes] = useState({})
  const [geoCoord, setGeoCoord] = useState([0, 0])
  const [imgCoord, setImgCoord] = useState([0, 0])
  const [showing, setShowing] = useState(false)

  useEffect(() => {
    remote.getNodes().then(nodes => setNodes(nodes))
  }, [])
  async function addNodeHandler() {
    const nodes = await remote.addNode({geoCoord, imgCoord})
    setNodes(nodes)
    setShowing(false)
  }

  /* ======================================== */
  return <>
    <button className="add_button" onClick={() => {setShowing(true)}}>新增節點</button>
    {
      showing &&
      <div className="dialog">
        <div className="template template1">
          <div>經緯度座標</div>
          <div>{geoCoord[0]},</div>
          <div>{geoCoord[1]}</div>
          <br />
          <div>圖片像素座標</div>
          <div>{imgCoord[0]}, {imgCoord[1]}</div>
          <br />
          <div className="button_group">
            <button onClick={() => {setShowing(false)}}>取消</button>
            <button onClick={addNodeHandler}>確認</button>
          </div>
        </div>
      </div>
    }
    <div className="page">
      <MapBox
        setGeoCoord={setGeoCoord}
        nodes={nodes}
      />
      <NtustMap
        setImgCoord={setImgCoord}
        nodes={nodes}
        setNodes={setNodes}
      />
    </div>
  </>
}

export default App
