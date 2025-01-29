import { Box, Container, Typography } from '@mui/material';

export default function Terms() {
  return (
    <Container
      component='main'
      maxWidth='md'
      className='terms'
      sx={{ padding: '2em' }}
    >
      <Typography variant='h4' fontWeight={'bold'} gutterBottom>
        Terms of Use
      </Typography>
      <Typography gutterBottom>Effective Date: TBA</Typography>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Acceptance of Terms
        </Typography>
        <Typography>
          By accessing or using KipNexus Academy, you agree to be bound by
          these Terms of Use. If you do not agree with these Terms, please do
          not access or use the Platform.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Description of Services
        </Typography>
        <Typography>
          KipNexus Academy offers online training courses in cybersecurity, web development, mobile app development (frontend & backend), digital marketing, and more. Our platform provides a variety of content, including video lectures, articles, coding exercises, and interactive learning tools. Users are responsible for ensuring they have the necessary equipment and internet connection for accessing the courses.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Account Registration
        </Typography>
        <Typography>
          To access certain features of the Platform, you may be required to
          create an account. You agree to provide accurate, current, and
          complete information during registration and to keep your account
          information updated. You are responsible for maintaining the
          confidentiality of your account credentials and for all activities
          that occur under your account.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          User Conduct
        </Typography>
        <Typography>
          You agree to use KipNexus Academy only for lawful purposes and in
          accordance with these Terms. Prohibited activities include, but are not limited to:
        </Typography>
        <ul>
          <li>Harassing, threatening, or harming other users</li>
          <li>Posting or transmitting any unlawful, harmful, or defamatory content</li>
          <li>Engaging in fraudulent activities or misrepresentation</li>
          <li>Uploading malware, viruses, or any harmful code</li>
          <li>Violating intellectual property rights</li>
        </ul>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Intellectual Property
        </Typography>
        <Typography>
          All original content, courses, and materials on KipNexus Academy are
          owned by KipNexus and are protected by copyright and intellectual property laws. Users may not reproduce, distribute, or modify the materials without prior written consent.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Payment Terms
        </Typography>
        <Typography>
          If you enroll in any paid courses, you agree to pay all applicable
          fees. KipNexus Academy reserves the right to update pricing and
          payment terms at any time, with prior notice. All payments are
          non-refundable unless otherwise stated.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Termination
        </Typography>
        <Typography>
          KipNexus Academy reserves the right to suspend or terminate your account at any time, with or without notice, if you violate these Terms.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Disclaimer of Warranties
        </Typography>
        <Typography>
          KipNexus Academy provides courses "as is" without warranties of any
          kind. We do not guarantee uninterrupted access to our platform, and we are not responsible for any technical issues users may experience.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Limitation of Liability
        </Typography>
        <Typography>
          KipNexus Academy and its staff shall not be liable for any indirect,
          incidental, or consequential damages resulting from the use of the
          platform.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Changes to These Terms
        </Typography>
        <Typography>
          We may update these Terms periodically. Continued use of the platform after updates constitutes acceptance of the revised Terms.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Contact Us
        </Typography>
        <Typography>
          For any questions regarding these Terms, please contact us at
          info@kipnexus.com.
        </Typography>
      </Box>
    </Container>
  );
}
