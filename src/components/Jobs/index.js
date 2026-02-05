import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsSearch} from 'react-icons/bs'
import {MdLocationOn} from 'react-icons/md'
import {FaBriefcase, FaStar} from 'react-icons/fa'
import {Link} from 'react-router-dom'
import Header from '../Header'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    jobsList: [],
    profileData: {},
    jobsApiStatus: apiStatusConstants.initial,
    profileApiStatus: apiStatusConstants.initial,
    searchInput: '',
    activeEmploymentTypes: [],
    activeSalaryRange: '',
  }

  componentDidMount() {
    this.getProfile()
    this.getJobs()
  }

  getProfile = async () => {
    this.setState({profileApiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/profile'
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const profileDetails = {
        name: data.profile_details.name,
        profileImageUrl: data.profile_details.profile_image_url,
        shortBio: data.profile_details.short_bio,
      }
      this.setState({
        profileData: profileDetails,
        profileApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({profileApiStatus: apiStatusConstants.failure})
    }
  }

  getJobs = async () => {
    this.setState({jobsApiStatus: apiStatusConstants.inProgress})
    const {activeEmploymentTypes, activeSalaryRange, searchInput} = this.state
    const employmentType = activeEmploymentTypes.join(',')
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/jobs?employment_type=${employmentType}&minimum_package=${activeSalaryRange}&search=${searchInput}`
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const updatedJobs = data.jobs.map(each => ({
        companyLogoUrl: each.company_logo_url,
        employmentType: each.employment_type,
        id: each.id,
        jobDescription: each.job_description,
        location: each.location,
        packagePerAnnum: each.package_per_annum,
        rating: each.rating,
        title: each.title,
      }))
      this.setState({
        jobsList: updatedJobs,
        jobsApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({jobsApiStatus: apiStatusConstants.failure})
    }
  }

  onChangeSearch = event => {
    this.setState({searchInput: event.target.value})
  }

  onEnterSearch = event => {
    if (event.key === 'Enter') {
      this.getJobs()
    }
  }

  updateEmploymentType = event => {
    const {activeEmploymentTypes} = this.state
    const {value} = event.target
    if (activeEmploymentTypes.includes(value)) {
      this.setState(
        prev => ({
          activeEmploymentTypes: prev.activeEmploymentTypes.filter(
            each => each !== value,
          ),
        }),
        this.getJobs,
      )
    } else {
      this.setState(
        prev => ({
          activeEmploymentTypes: [...prev.activeEmploymentTypes, value],
        }),
        this.getJobs,
      )
    }
  }

  updateSalaryRange = event => {
    this.setState({activeSalaryRange: event.target.value}, this.getJobs)
  }

  renderLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderProfileView = () => {
    const {profileData, profileApiStatus} = this.state
    switch (profileApiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      case apiStatusConstants.success:
        return (
          <div className="profile-card">
            <img
              src={profileData.profileImageUrl}
              alt="profile"
              className="profile-img"
            />
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-bio">{profileData.shortBio}</p>
          </div>
        )
      default:
        return (
          <div className="profile-failure-view">
            <button
              type="button"
              className="retry-btn"
              onClick={this.getProfile}
            >
              Retry
            </button>
          </div>
        )
    }
  }

  renderJobsListView = () => {
    const {jobsList, jobsApiStatus} = this.state
    switch (jobsApiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      case apiStatusConstants.success:
        if (jobsList.length === 0) {
          return (
            <div className="no-jobs-view">
              <img
                src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
                alt="no jobs"
                className="no-jobs-img"
              />
              <h1>No Jobs Found</h1>
              <p>We could not find any jobs. Try other filters.</p>
            </div>
          )
        }
        return (
          <ul className="jobs-list">
            {jobsList.map(each => (
              <li key={each.id} className="job-item">
                <Link to={`/jobs/${each.id}`} className="link-item">
                  <div className="logo-title-container">
                    <img
                      src={each.companyLogoUrl}
                      alt="company logo"
                      className="company-logo"
                    />
                    <div>
                      <h1 className="job-title">{each.title}</h1>
                      <div className="rating-container">
                        <FaStar className="star" />
                        <p>{each.rating}</p>
                      </div>
                    </div>
                  </div>
                  <div className="location-package-container">
                    <div className="location-type">
                      <div className="icon-container">
                        <MdLocationOn />
                        <p>{each.location}</p>
                      </div>
                      <div className="icon-container">
                        <FaBriefcase />
                        <p>{each.employmentType}</p>
                      </div>
                    </div>
                    <p className="package">{each.packagePerAnnum}</p>
                  </div>
                  <hr className="hr-line" />
                  <h1 className="description-heading">Description</h1>
                  <p className="job-description">{each.jobDescription}</p>
                </Link>
              </li>
            ))}
          </ul>
        )
      default:
        return (
          <div className="failure-view">
            <img
              src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
              alt="failure view"
              className="failure-img"
            />
            <h1>Oops! Something Went Wrong</h1>
            <p>We cannot seem to find the page you are looking for</p>
            <button type="button" className="retry-btn" onClick={this.getJobs}>
              Retry
            </button>
          </div>
        )
    }
  }

  render() {
    const {searchInput} = this.state
    const {employmentTypesList, salaryRangesList} = this.props

    return (
      <div className="jobs-bg-container">
        <Header />
        <div className="jobs-content">
          <div className="side-bar">
            {this.renderProfileView()}
            <hr className="hr-line" />
            <h1 className="filter-heading">Type of Employment</h1>
            <ul className="filter-list">
              {employmentTypesList.map(each => (
                <li key={each.employmentTypeId} className="filter-item">
                  <input
                    type="checkbox"
                    id={each.employmentTypeId}
                    value={each.employmentTypeId}
                    onChange={this.updateEmploymentType}
                  />
                  <label htmlFor={each.employmentTypeId}>{each.label}</label>
                </li>
              ))}
            </ul>
            <hr className="hr-line" />
            <h1 className="filter-heading">Salary Range</h1>
            <ul className="filter-list">
              {salaryRangesList.map(each => (
                <li key={each.salaryRangeId} className="filter-item">
                  <input
                    type="radio"
                    name="salary"
                    id={each.salaryRangeId}
                    value={each.salaryRangeId}
                    onChange={this.updateSalaryRange}
                  />
                  <label htmlFor={each.salaryRangeId}>{each.label}</label>
                </li>
              ))}
            </ul>
          </div>
          <div className="jobs-list-container">
            <div className="search-input-container">
              <input
                type="search"
                className="search-input"
                placeholder="Search"
                value={searchInput}
                onChange={this.onChangeSearch}
                onKeyDown={this.onEnterSearch}
              />
              <button
                type="button"
                data-testid="searchButton"
                className="search-button"
                onClick={this.getJobs}
              >
                <BsSearch className="search-icon" />
              </button>
            </div>
            {this.renderJobsListView()}
          </div>
        </div>
      </div>
    )
  }
}

export default Jobs
