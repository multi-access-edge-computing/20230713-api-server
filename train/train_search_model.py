import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
import redis
import joblib

nltk.download('punkt')
nltk.download('stopwords')

redis_client = redis.Redis(host='localhost', port=6379)
redis_keys = redis_client.keys()
topics = redis_client.mget(redis_keys)

titles = {}

for idx, topic in enumerate(topics):
    titles[str(idx + 1)] = eval(topic.decode('utf-8'))['title']['S']

def remove_stopwords(text):
    stop_words = set(stopwords.words('english'))
    tokens = word_tokenize(text)
    tokens = [token for token in tokens if token.lower() not in stop_words]
    return ' '.join(tokens)

processed_titles = [remove_stopwords(doc) for doc in titles.values()]

vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(processed_titles)

joblib.dump(vectorizer, 'vectorizer.pkl')
joblib.dump(tfidf_matrix, 'tfidf_matrix.pkl')
