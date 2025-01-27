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
        <Typography variant='p'>
          By accessing or using Aestheitos platform, you agree to be bound by
          these Terms of Use. If you do not agree with these Terms, please do
          not access or use the Platform.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Description of Services
        </Typography>
        <Typography variant='p'>
          The Platform provides online training courses and programs for fitness
          and calisthenics. We offer a variety of content, including videos,
          blogs, and interactive tools. You are responsible for providing your
          own equipment and ensuring a safe environment for exercise.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Account Registration
        </Typography>
        <Typography variant='p'>
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
        <Typography variant='p'>
          You agree to use the Platform only for lawful purposes and in
          accordance with these Terms. You may not use the Platform in any way
          that violates any applicable federal, state, local, or international
          law or regulation. Prohibited activities include, but are not limited
          to:
        </Typography>
        <ul>
          <li>Harassing, threatening, or harming other users</li>
          <li>
            Posting or transmitting any unlawful, harmful, defamatory, obscene,
            or otherwise objectionable content
          </li>
          <li>Impersonating any person or entity</li>
          <li>Interfering with or disrupting the operation of the Platform</li>
          <li>
            Uploading or transmitting any viruses, worms, or other malicious
            code
          </li>
        </ul>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Intellectual Property
        </Typography>
        <Typography variant='p'>
          The Platform and its original content, features, and functionality are
          owned by [Your Company Name] and are protected by copyright,
          trademark, patent, trade secret, and other intellectual property or
          proprietary rights laws. You may not modify, copy, distribute,
          transmit, display, perform, reproduce, publish, license, create
          derivative works from, transfer, or sell any information, software,
          products, or services obtained from the Platform without our express
          written consent.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Payment Terms
        </Typography>
        <Typography variant='p'>
          If you purchase any courses or programs on the Platform, you agree to
          pay all applicable fees. We may change our fees at any time, but we
          will provide you with notice of any changes. All payments are
          non-refundable unless otherwise stated.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Termination
        </Typography>
        <Typography variant='p'>
          We may terminate or suspend your access to the Platform at any time,
          with or without cause or notice, for any reason, including if you
          violate these Terms.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Disclaimer of Warranties
        </Typography>
        <Typography variant='p'>
          The Platform is provided "as is" without warranty of any kind, either
          express or implied, including, but not limited to, the implied
          warranties of merchantability, fitness for a particular purpose, or
          non-infringement. We do not warrant that the Platform will be
          uninterrupted or error-free, that defects will be corrected, or that
          the Platform is free of viruses or other harmful components.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Limitation of Liability
        </Typography>
        <Typography variant='p'>
          In no event shall Aestheitos' staff be liable for any direct,
          indirect, incidental, special, consequential, or punitive damages
          arising out of or in connection with your use of the Platform, whether
          based on warranty, contract, tort, or any other legal theory, even if
          we have been advised of the possibility of such damages.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Changes to These Terms
        </Typography>
        <Typography variant='p'>
          We may update these Terms from time to time. We will notify you of any
          changes by posting the new Terms on the Platform. You are advised to
          review these Terms periodically for any changes.
        </Typography>
      </Box>
      <Box component='section'>
        <Typography variant='h5' gutterBottom fontWeight={'bold'}>
          Contact Us
        </Typography>
        <Typography variant='p'>
          If you have any questions about these Terms, please contact us at
          jerichokunserrano@gmail.com.
        </Typography>
      </Box>
    </Container>
  );
}
