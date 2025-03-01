import os
from openai import OpenAI
from dotenv import load_dotenv
import httpx
import logging
import json
import traceback

# ロギングを設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# OpenAI APIキーの確認と記録
api_key = os.getenv("OPENAI_API_KEY")
if not api_key or api_key == "YOUR_OPENAI_API_KEY_HERE" or api_key == "sk-dummy-key-for-testing":
    logger.error("有効なOpenAI APIキーが設定されていません。.envファイルを確認してください。")
    client = None
else:
    try:
        # カスタムHTTPXクライアントを作成
        http_client = httpx.Client(
            base_url="https://api.openai.com/v1",
            follow_redirects=True,
            timeout=60.0
        )

        # カスタムクライアントを使用してOpenAIインスタンスを初期化
        client = OpenAI(
            api_key=api_key,
            http_client=http_client
        )
        logger.info("OpenAIクライアントが正常に初期化されました。")
    except Exception as e:
        logger.error(f"OpenAIクライアントの初期化中にエラーが発生しました: {str(e)}")
        logger.error(f"詳細な例外情報: {traceback.format_exc()}")
        client = None

def generate_topic():
    """AIによる大喜利のお題生成"""
    
    if not api_key or api_key == "YOUR_OPENAI_API_KEY_HERE" or api_key == "sk-dummy-key-for-testing":
        error_msg = "有効なOpenAI APIキーが設定されていないため、お題を生成できません。"
        logger.error(error_msg)
        return error_msg
    
    if client is None:
        error_msg = "OpenAIクライアントが初期化されていません。APIキーと接続を確認してください。"
        logger.error(error_msg)
        return error_msg
    
    prompt = """
    あなたは大喜利のお題を考える専門家です。面白くて、回答が多様に考えられるお題を1つ考えてください。
    お題は50文字以内で、誰でも理解できる平易な日本語で作成してください。
    
    お題だけを返してください。説明や前置き、かぎかっこなどは不要です。
    """
    
    try:
        logger.info("OpenAI APIを使用してお題を生成します...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": "大喜利のお題を1つ考えてください。"}
            ],
            max_tokens=100,
            temperature=0.9
        )
        
        # レスポンスから余分な記号や空白を削除
        topic = response.choices[0].message.content.strip()
        topic = topic.replace('"', '').replace('「', '').replace('」', '')
        
        logger.info(f"お題が正常に生成されました: {topic}")
        return topic
    except Exception as e:
        error_msg = f"お題生成中にエラーが発生しました: {str(e)}"
        logger.error(error_msg)
        logger.error(f"詳細な例外情報: {traceback.format_exc()}")
        return error_msg

def evaluate_answer(topic, answer):
    """AIによる大喜利の回答評価"""
    
    if not api_key or api_key == "YOUR_OPENAI_API_KEY_HERE" or api_key == "sk-dummy-key-for-testing":
        error_msg = "有効なOpenAI APIキーが設定されていないため、回答を評価できません。"
        logger.error(error_msg)
        return {
            "score": 5,
            "comment": error_msg
        }
    
    if client is None:
        error_msg = "OpenAIクライアントが初期化されていません。APIキーと接続を確認してください。"
        logger.error(error_msg)
        return {
            "score": 5,
            "comment": error_msg
        }
    
    prompt = f"""
    あなたは大喜利の回答を評価するユーモア満載の審査員です。以下の大喜利のお題に対する回答を評価してください。

    【お題】
    {topic}
    
    【回答】
    {answer}
    
    回答を1〜10点で評価してください。評価の基準は「おもしろいかどうか」だけをベースに考えてください。
    ユーモアあふれる表現やジョークを交えた評価コメントを書いてください。回答が面白ければ高得点を与えてください。
    
    以下のJSON形式で回答してください:
    {{
      "score": [1-10の整数],
      "comment": "ユーモアあふれる評価コメント（100文字以内）"
    }}
    """
    
    try:
        logger.info("OpenAI APIを使用して回答を評価します...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": "この回答をJSON形式で評価してください。面白さだけで判断してください。必ずjsonで返してください。"}
            ],
            max_tokens=150,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        # JSONレスポンスをパース
        evaluation = json.loads(response.choices[0].message.content)
        logger.info(f"回答が正常に評価されました: スコア {evaluation.get('score', 5)}")
        
        return {
            "score": int(evaluation.get("score", 5)),
            "comment": evaluation.get("comment", "評価できませんでした。")
        }
    except Exception as e:
        error_msg = f"回答評価中にエラーが発生しました: {str(e)}"
        logger.error(error_msg)
        logger.error(f"詳細な例外情報: {traceback.format_exc()}")
        return {
            "score": 5,
            "comment": error_msg
        }

def reevaluate_popular_answer(topic, answer, vote_count):
    """投票数の多い人気回答を再評価する関数"""
    
    if not api_key or api_key == "YOUR_OPENAI_API_KEY_HERE" or api_key == "sk-dummy-key-for-testing":
        error_msg = "有効なOpenAI APIキーが設定されていないため、回答を再評価できません。"
        logger.error(error_msg)
        return {
            "score": 5,
            "comment": error_msg
        }
    
    if client is None:
        error_msg = "OpenAIクライアントが初期化されていません。APIキーと接続を確認してください。"
        logger.error(error_msg)
        return {
            "score": 5,
            "comment": error_msg
        }
    
    prompt = f"""
    あなたは大喜利の回答を評価するユーモア満載の審査員です。以下の大喜利のお題に対する回答は、多くの人（{vote_count}人）から支持を得た人気回答です。

    【お題】
    {topic}
    
    【人気回答】
    {answer}
    
    この人気回答を1〜10点で再評価してください。この回答がなぜ多くの人に支持されたのか、その魅力や面白さを深く分析してください。
    ユーモア、意外性、知性などの観点から、回答の優れた点を詳しく述べてください。
    
    以下のJSON形式で回答してください:
    {{
      "score": [1-10の整数、人気度を加味した評価],
      "comment": "その回答の魅力を分析したユーモア溢れる評価コメント（100文字以内）"
    }}
    """
    
    try:
        logger.info("OpenAI APIを使用して人気回答を再評価します...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": "この人気回答をJSON形式で再評価してください。面白さと人気度を加味して判断してください。必ずjsonで返してください。"}
            ],
            max_tokens=200,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        # JSONレスポンスをパース
        evaluation = json.loads(response.choices[0].message.content)
        logger.info(f"人気回答が再評価されました: スコア {evaluation.get('score', 5)}")
        
        return {
            "score": int(evaluation.get("score", 5)),
            "comment": evaluation.get("comment", "評価できませんでした。")
        }
    except Exception as e:
        error_msg = f"人気回答の再評価中にエラーが発生しました: {str(e)}"
        logger.error(error_msg)
        logger.error(f"詳細な例外情報: {traceback.format_exc()}")
        return {
            "score": 5,
            "comment": error_msg
        } 