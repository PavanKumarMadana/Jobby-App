import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {MdLocationOn} from 'react-icons/md'
import {FaBriefcase, FaStar} from 'react-icons/fa'
import {BiLinkExternal} from 'react-icons/bi'
import Header from '../Header'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class JobItemDetails extends Component {
  state = {
    jobDetails: {},
    similarJobs: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getJobData()
  }

  getFormattedData = data => ({
    companyLogoUrl: data.company_logo_url,
    companyWebsiteUrl: data.company_website_url,
    employmentType: data.employment_type,
    id: data.id,
    jobDescription: data.job_description,
    lifeAtCompany: {
      description: data.life_at_company.description,
      imageUrl: data.life_at_company.image_url,
    },
    location: data.location,
    packagePerAnnum: data.package_per_annum,
    rating: data.rating,
    skills: data.skills.map(eachSkill => ({
      imageUrl: eachSkill.image_url,
      name: eachSkill.name,
    })),
    title: data.title,
  })

  getJobData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {match} = this.props
    const {params} = match
    const {id} = params
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/jobs/${id}`
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const updatedData = this.getFormattedData(data.job_details)
      const updatedSimilarJobs = data.similar_jobs.map(each => ({
        companyLogoUrl: each.company_logo_url,
        employmentType: each.employment_type,
        id: each.id,
        jobDescription: each.job_description,
        location: each.location,
        rating: each.rating,
        title: each.title,
      }))
      this.setState({
        jobDetails: updatedData,
        similarJobs: updatedSimilarJobs,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderFailureView = () => (
    <div className="failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1>Oops! Something Went Wrong</h1>
      <p>We cannot seem to find the page you are looking for</p>
      <button type="button" className="retry-btn" onClick={this.getJobData}>
        Retry
      </button>
    </div>
  )

  renderJobDetailsView = () => {
    const {jobDetails, similarJobs} = this.state
    const {
      companyLogoUrl,
      companyWebsiteUrl,
      employmentType,
      jobDescription,
      lifeAtCompany,
      location,
      packagePerAnnum,
      rating,
      skills,
      title,
    } = jobDetails

    return (
      <div className="job-details-view">
        <div className="job-card">
          <div className="logo-section">
            <img
              src={companyLogoUrl}
              alt="job details company logo"
              className="logo"
            />
            <div>
              <h1 className="job-title">{title}</h1>
              <div className="rating">
                <FaStar className="star" /> <p>{rating}</p>
              </div>
            </div>
          </div>
          <div className="info-row">
            <div className="location-type">
              <div className="icon-container">
                <MdLocationOn /> <p>{location}</p>
              </div>
              <div className="icon-container">
                <FaBriefcase /> <p>{employmentType}</p>
              </div>
            </div>
            <p className="package">{packagePerAnnum}</p>
          </div>
          <hr className="hr-line" />
          <div className="desc-header">
            <h1>Description</h1>
            <a
              href={companyWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="visit-link"
            >
              Visit <BiLinkExternal />
            </a>
          </div>
          <p className="description-text">{jobDescription}</p>
          <h1 className="skills-heading">Skills</h1>
          <ul className="skills-list">
            {skills.map(each => (
              <li key={each.name} className="skill-item">
                <img
                  src={each.imageUrl}
                  alt={each.name}
                  className="skill-img"
                />
                <p>{each.name}</p>
              </li>
            ))}
          </ul>
          <div className="life-at-company">
            <div className="life-content">
              <h1>Life at Company</h1>
              <p>{lifeAtCompany.description}</p>
            </div>
            <img
              src={lifeAtCompany.imageUrl}
              alt="life at company"
              className="life-img"
            />
          </div>
        </div>
        <h1 className="similar-jobs-heading">Similar Jobs</h1>
        <ul className="similar-jobs-list">
          {similarJobs.map(each => (
            <li key={each.id} className="similar-card">
              <div className="logo-section">
                <img
                  src={each.companyLogoUrl}
                  alt="similar job company logo"
                  className="similar-logo"
                />
                <div>
                  <h1>{each.title}</h1>
                  <div className="rating">
                    <FaStar className="star" /> <p>{each.rating}</p>
                  </div>
                </div>
              </div>
              <h1 className="desc-title">Description</h1>
              <p className="similar-desc">{each.jobDescription}</p>
              <div className="location-type">
                <div className="icon-container">
                  <MdLocationOn /> <p>{each.location}</p>
                </div>
                <div className="icon-container">
                  <FaBriefcase /> <p>{each.employmentType}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  render() {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      case apiStatusConstants.success:
        return (
          <>
            <Header />
            <div className="job-details-container">
              {this.renderJobDetailsView()}
            </div>
          </>
        )
      default:
        return this.renderFailureView()
    }
  }
}

export default JobItemDetails
