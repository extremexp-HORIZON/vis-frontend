
const NotFound = () => {

  return (
    <div id="error-page">
      <div style={{ display: 'flex', alignItems: 'center', columnGap: 4, userSelect: 'none' }}>
        <h1 style={{ fontSize: 130, margin: 0 }}>4</h1>
        <img src="/images/extremexp-logo.png" height={130} alt='Extremexp logo'/>
        {/* <h1 style={{fontSize: 130, margin: 0}}>0</h1> */}
        <h1 style={{ fontSize: 130, margin: 0 }}>4</h1>
      </div>

      <p style={{ userSelect: 'none' }}>Page not found.</p>
      <p style={{ userSelect: 'none' }}>It looks like you've been lost.</p>
    </div>
  );
};

export default NotFound;
