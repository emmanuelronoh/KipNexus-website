import { useTheme } from '@emotion/react';
import {
  Box,
  Container,
  ThemeProvider,
  Typography,
  responsiveFontSizes,
} from '@mui/material';

export default function Privacy() {
  let theme = useTheme();
  theme = responsiveFontSizes(theme);
  return (
    <>
      <Container
        component={'main'}
        maxWidth='md'
        sx={{ padding: '2em' }}
        className='privacy'
      >
        <ThemeProvider theme={theme}>
          <Typography variant='h4' fontWeight={'bold'} gutterBottom>
            Privacy Policy
          </Typography>
          <Typography gutterBottom>Effective Date: TBA</Typography>
          <Box component={'section'}>
            <Typography variant='h5' gutterBottom fontWeight={'bold'}>
              Introduction
            </Typography>
            <Typography variant='p'>
              <b>KipNexus</b> is committed to protecting the privacy of our
              users (you). This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our online
              learning platform and management system the 'Platform'.
            </Typography>
            <br />
            <br />
            <Typography variant='p'>
              By accessing or using the Platform, you agree to the terms of this
              Privacy Policy. If you do not agree with our practices, please do
              not access or use the Platform.
            </Typography>
          </Box>
          <Box component={'section'}>
            <Typography variant='h5' fontWeight={'bold'} gutterBottom>
              Information We Collect
            </Typography>
            We may collect the following types of information:
            <ul>
              <li>
                <b>Personal Information:</b> This includes information that can
                identify you, such as your name, email address, payment
                information, and any other information you voluntarily provide
                when registering an account or interacting with the Platform.
              </li>
              <li>
                <b>Usage Data:</b> This includes information about how you use
                the Platform, such as the courses you enroll in, your progress,
                and other interactions with the Platform's features.
              </li>
              <li>
                <b>Device Information:</b> This includes information about the
                device you use to access the Platform, such as your IP address,
                browser type, operating system, and device identifiers.
              </li>
              <li>
                <b>Cookies and Similar Technologies:</b> We may use cookies and
                similar tracking technologies to collect information about your
                browsing behavior and preferences.
              </li>
            </ul>
          </Box>
          <Box component={'section'}>
            <Typography variant='h5' fontWeight={'bold'} gutterBottom>
              How We Use Your Information
            </Typography>
            We may use your information for the following purposes:
            <ul>
              <li>
                <b>To provide and maintain the Platform:</b> This includes
                providing you with access to courses, managing your account,
                processing payments, and providing customer support.
              </li>
              <li>
                <b>To personalize your experience:</b> This includes
                recommending courses based on your interests and providing
                personalized content.
              </li>
              <li>
                <b>To improve the Platform: </b>This includes analyzing usage
                data to identify areas for improvement and enhance the overall
                user experience.
              </li>
              <li>
                <b>To communicate with you:</b> This includes sending you emails
                about your account, new courses, and other Platform-related
                updates. You can opt-out of these communications at any time.
              </li>
              <li>
                <b>To comply with legal obligations:</b> We may be required to
                disclose your information to comply with applicable laws,
                regulations, or legal processes.
              </li>
            </ul>
          </Box>
          <Box component={'section'}>
            <Typography variant='h5' fontWeight={'bold'} gutterBottom>
              How We Share Your Information
            </Typography>
            We may share your information with the following parties:
            <ul>
              <li>
                <b>Service Providers:</b> We may share your information with
                third-party service providers who help us operate the Platform,
                such as payment processors, hosting providers, and analytics
                providers.
              </li>
              <li>
                <b>Business Partners:</b> We may share your information with
                business partners who offer products or services that may be of
                interest to you.
              </li>
              <li>
                <b>Other Users:</b> If you participate in community forums or
                other interactive features of the Platform, your information may
                be visible to other users.
              </li>
              <li>
                <b>Legal Authorities:</b> We may share your information with
                legal authorities if required to do so by law or in response to
                a valid legal request.
              </li>
            </ul>
          </Box>
          <Box component={'section'}>
            <Typography variant='h5' fontWeight={'bold'} gutterBottom>
              Your Choices
            </Typography>
            You have the following choices regarding your information:
            <ul>
              <li>
                <b>Access and Update:</b> You can access and update your account
                information at any time by logging into your account.
              </li>
              <li>
                <b>Cookies:</b> You can manage your cookie preferences through
                your browser settings.
              </li>
              <li>
                <b>Marketing Communications:</b> You can opt-out of receiving
                marketing communications from us by following the unsubscribe
                instructions in our emails.
              </li>
            </ul>
          </Box>
          <Box component={'section'}>
            <Typography variant='h5' fontWeight={'bold'} gutterBottom>
              Data Security
            </Typography>
            <Typography variant='p'>
              We take reasonable measures to protect your information from
              unauthorized access, disclosure, alteration, or destruction.
              However, no method of transmission over the internet or electronic
              storage is completely secure. Therefore, we cannot guarantee
              absolute security.
            </Typography>
          </Box>
          <Box component={'section'}>
            <Typography variant='h5' fontWeight={'bold'} gutterBottom>
              Children's Privacy
            </Typography>
            <Typography variant='p'>
              The Platform is not intended for children under the age of 13. We
              do not knowingly collect personal information from children under
              13. If you are a parent or guardian and believe that your child
              has provided us with personal information, please contact us
              immediately.
            </Typography>
          </Box>
          <Box component={'section'}>
            <Typography variant='h5' fontWeight={'bold'} gutterBottom>
              Changes to This Privacy Policy
            </Typography>
            <Typography variant='p'>
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on the
              Platform. You are advised to review this Privacy Policy
              periodically for any changes.
            </Typography>
          </Box>
          <Box component={'section'}>
            <Typography variant='h5' fontWeight={'bold'} gutterBottom>
              Contact Us
            </Typography>
            <Typography>
              If you have any questions about this Privacy Policy, please
              contact us at: jerichokunserrano@gmail.com
            </Typography>
          </Box>
        </ThemeProvider>
      </Container>
    </>
  );
}
