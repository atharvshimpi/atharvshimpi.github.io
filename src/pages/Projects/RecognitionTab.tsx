import { recognition } from '../../data/awards'

export default function RecognitionTab() {
  return (
    <div id="pt-recognition" className="tp on">
      <div className="awards-grid" style={{ paddingTop: '.8rem' }}>
        {recognition.map((entry) => (
          <div className="award-card" key={entry.label}>
            <div className="award-n">{entry.value}</div>
            <div className="award-l">{entry.label}</div>
            <div className="award-sub">{entry.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
