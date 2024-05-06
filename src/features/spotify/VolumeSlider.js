import ReactSlider from "react-slider"
        
const VolumeSlider = ({volume, setVolume}) => {
    return (
        <ReactSlider
            min={0}
            max={100}
            className="customSlider"
            trackClassName="customSlider-track"
            thumbClassName="customSlider-thumb"
            value={volume}
            onChange={(newValue) => setVolume(newValue)}
        />
    )
}

export default VolumeSlider
