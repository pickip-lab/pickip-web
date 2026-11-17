import { Link } from 'react-router'
import pickipIcon from '../assets/pickip-icon.png'

export function Brand() {
  return <Link to="/" className="brand"><img src={pickipIcon} alt="" /><span>PICKIP</span></Link>
}
