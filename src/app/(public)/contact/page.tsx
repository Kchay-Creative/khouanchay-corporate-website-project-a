import {
  ContentSection,
  PageHero,
  Placeholder,
} from "@/components/public/sections";
export default function ContactPage() {
  return (
    <main>
      <PageHero
        title="Contact Us"
        description="Reach Khouanchay Trading through our official contact channels."
      />
      <ContentSection title="Company Information">
        <div className="three-grid">
          {["Address", "Phone", "Email"].map((label) => (
            <div className="info-tile" key={label}>
              <h3>{label}</h3>
              <p>Official details pending</p>
            </div>
          ))}
        </div>
      </ContentSection>
      <ContentSection title="Map" className="section-tint">
        <Placeholder
          title="Location map"
          detail="The verified office address and map will be added later."
        />
      </ContentSection>
      <ContentSection title="Contact Form">
        <div className="form-placeholder">
          <p className="notice">
            Contact submission is unavailable until the official destination and
            privacy process are specified.
          </p>
          <div className="form-grid">
            <label>
              Name
              <input disabled placeholder="Name" />
            </label>
            <label>
              Email
              <input disabled placeholder="Email" />
            </label>
            <label>
              Phone
              <input disabled placeholder="Phone" />
            </label>
            <label>
              Subject
              <input disabled placeholder="Subject" />
            </label>
            <label className="full-width">
              Message
              <textarea disabled placeholder="Message" rows={5} />
            </label>
          </div>
          <button className="button button-primary" disabled>
            Send Message
          </button>
        </div>
      </ContentSection>
      <ContentSection title="Branches & Locations" className="section-tint">
        <Placeholder
          title="Locations"
          detail="Verified branch and warehouse details pending."
        />
      </ContentSection>
    </main>
  );
}
