import ReactSlider from "react-slider"
        
const VolumeSlider = ({volume, setVolume, setUsingVolumeSlider, setIsVolumeSliderFocused, resetVolumeSliderFocus, cancelVolumeSliderCooldown}) => {
    return (
        <ReactSlider
            min={0}
            max={100}
            className="customSlider"
            trackClassName="customSlider-track"
            thumbClassName="customSlider-thumb"
            value={volume}
            onChange={(newValue) => {
                cancelVolumeSliderCooldown()
                setIsVolumeSliderFocused(true)
                setVolume(newValue)
                resetVolumeSliderFocus()
            }}
            onBeforeChange={() => {
                setUsingVolumeSlider(true)
            }}
            onAfterChange={() => {
                setUsingVolumeSlider(false)
            }}
        />
    )
}

export default VolumeSlider
