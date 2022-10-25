// ** MUI Imports
import Grid from '@mui/material/Grid'
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import CardWithCollapse from 'src/views/cards/CardWithCollapse'

import { useCookies } from 'react-cookie'
import { useRouter } from 'next/router'
import axios from 'axios'

const Dashboard: React.FC<{ news_data: { [key: string]: any } }> = ({ news_data }) => {
  const [cookies, set_cookies] = useCookies();
  const router = useRouter();
  if (!cookies.user?.session_token && (process as any).browser) {
    router.push('/401');
    return (<></>);
  }
  return (
    <ApexChartWrapper>
      <Grid container spacing={6}>
        { news_data.articles.map((article: any) => <Grid item xs={12} md={4}>
          <CardWithCollapse image_url={ article.urlToImage } title={ article.title } description={ article.description } content={ article.content } url= { article.url }/>
        </Grid>) }
      </Grid>
    </ApexChartWrapper>
  )
}

export const getServerSideProps = async () => {
  const news_data = (await axios.get('https://newsapi.org/v2/everything?q=civic&from=2022-10-21&sortBy=popularity&apiKey=27624f47850048e0b3eb5b54fd0b85bf', { validateStatus: () => true })).data;
  return {
    props: {
      news_data
    }
  }
}

export default Dashboard