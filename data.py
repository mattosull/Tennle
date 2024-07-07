import aiohttp #type: ignore
import asyncio
from aiohttp import ClientSession, ClientResponseError, ClientConnectionError, ServerDisconnectedError #type: ignore
from bs4 import BeautifulSoup
import time
import json

MAX_RETRIES = 3
RETRY_DELAY = 2

async def fetch(session, url, retries=MAX_RETRIES):
    for attempt in range(retries):
        try:
            async with session.get(url) as response:
                response.raise_for_status()
                return await response.text()
        except (ClientResponseError, ClientConnectionError, ServerDisconnectedError) as e:
            print(f"Attempt {attempt + 1} failed for {url}: {e}")
            if attempt + 1 < retries:
                time.sleep(RETRY_DELAY)
            else:
                raise

async def fetch_all(session, urls):
    tasks = [fetch(session, url) for url in urls]
    return await asyncio.gather(*tasks)

async def scrape_player_rankings(url, players_list):
    async with ClientSession() as session:
        response_text = await fetch(session, url)
        soup = BeautifulSoup(response_text, 'html.parser')

        tables = soup.find_all('table', class_='result')
        if len(tables) >= 2:
            table = tables[1]
            tbody = table.find('tbody')
            rows = tbody.find_all('tr')

            player_urls = []
            for row in rows:
                rank_elem = row.find('td', class_='rank first')
                name_elem = row.find('td', class_='t-name').find('a')
                country_elem = row.find('td', class_='tl')

                if rank_elem and name_elem and country_elem:
                    player_link = "https://www.tennisexplorer.com" + name_elem.get('href')
                    player_urls.append(player_link)

            player_responses = await fetch_all(session, player_urls)

            for i, row in enumerate(rows):
                rank_elem = row.find('td', class_='rank first')
                name_elem = row.find('td', class_='t-name').find('a')
                country_elem = row.find('td', class_='tl')

                if rank_elem and name_elem and country_elem:
                    rank = int(rank_elem.text.strip().rstrip('.'))
                    name = name_elem.text.strip()
                    country = country_elem.text.strip()
                    individual_soup = BeautifulSoup(player_responses[i], 'html.parser')

                    summary = individual_soup.find('tr', class_='summary fullonly')
                    if summary:
                        titles_col = summary.find_all('td', class_='titles-col')
                    else:
                        summary = individual_soup.find_all('tr', class_='summary')
                    titles = int(titles_col[0].text.strip())
                    

                    profile_details = individual_soup.find('table', class_='plDetail')

                    photo_src = None
                    photo_td = profile_details.find('td', class_='photo')
                    photo_img = photo_td.find('img')
                    photo_src = "https://www.tennisexplorer.com/" + photo_img.get('src')

                    age = None
                    highest_rank = None
                    gender = None

                    date_divs = individual_soup.find_all('div', class_='date')
                    for div in date_divs:
                        text = div.text.strip()
                        if text.startswith('Age:'):
                            age = int(text.split(':')[1].strip().split(' ')[0])
                        elif text.startswith('Current/Highest rank - singles:'):
                            highest_rank = int(text.split(':')[1].strip().split('/')[1].strip().rstrip('.'))
                        elif text.startswith('Sex:'):
                            gender = text.split(':')[1].strip()
                            if gender == "man":
                                gender = "Male"
                            elif gender == "woman":
                                gender = "Female"

                    player_info = {
                        'rank': rank,
                        'name': name,
                        'country': country,
                        'photo_src': photo_src,
                        'age': age,
                        'highest_rank': highest_rank,
                        'titles': titles,
                        'gender': gender,
                    }
                    players_list.append(player_info)
                    print(player_info)

    return players_list

async def main():
    url_women = 'https://www.tennisexplorer.com/ranking/wta-women/?page=1'
    url_men = 'https://www.tennisexplorer.com/ranking/atp-men/?page=1'
    players_list = []

    players_list = await scrape_player_rankings(url_men, players_list)
    players_list = await scrape_player_rankings(url_women, players_list)

    with open('players.json', 'w') as f:
        json.dump(players_list, f, indent=4)

asyncio.run(main())