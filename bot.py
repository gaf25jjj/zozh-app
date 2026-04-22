import asyncio
import os
import logging
from aiogram import Bot, Dispatcher, Router
from aiogram.filters import CommandStart, Command
from aiogram.types import Message, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from dotenv import load_dotenv

load_dotenv()
BOT_TOKEN = os.getenv('BOT_TOKEN', '')
WEBAPP_URL = os.getenv('WEBAPP_URL', 'https://example.com')

router = Router()
logger = logging.getLogger(__name__)

WELCOME = """
🩺 *ZdorovLife Mini App*\n\nЭто интерактивное цифровое средство гигиенического воспитания по теме здорового образа жизни и основ медицинской профилактики.\n\nВ мини-приложении пользователь проходит игровые ситуации выбора и видит, как привычки влияют на:\n• здоровье\n• энергию\n• иммунитет\n• стресс\n• риск заболеваний\n\nНажми кнопку ниже, чтобы открыть игру.
"""


def app_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[
            InlineKeyboardButton(
                text='🚀 Открыть мини-приложение',
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ]]
    )


@router.message(CommandStart())
async def start_handler(message: Message) -> None:
    user = message.from_user
    logger.info(
        '/start received: user_id=%s username=%s',
        user.id if user else None,
        user.username if user else None,
    )
    logger.info('/start handler reached for user_id=%s', user.id if user else None)
    try:
        await message.answer(WELCOME, parse_mode='Markdown', reply_markup=app_keyboard())
        logger.info('/start reply sent for user_id=%s', user.id if user else None)
    except Exception:
        logger.exception('/start reply failed for user_id=%s', user.id if user else None)
        raise


@router.message(Command('app'))
async def app_handler(message: Message) -> None:
    await message.answer('Открой мини-приложение кнопкой ниже.', reply_markup=app_keyboard())


@router.message(Command('about'))
async def about_handler(message: Message) -> None:
    await message.answer(
        'Проект обучает подростков и студентов навыкам ЗОЖ через игровую механику выбора. '
        'После каждого решения пользователь получает короткое профилактическое объяснение.'
    )


async def main() -> None:
    if not BOT_TOKEN:
        raise RuntimeError('Не найден BOT_TOKEN в .env')
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s [%(name)s] %(message)s',
    )
    bot = Bot(BOT_TOKEN)
    webhook_info = await bot.get_webhook_info()
    if webhook_info.url:
        logger.warning(
            'Active webhook detected (%s). Removing webhook to allow polling.',
            webhook_info.url,
        )
        await bot.delete_webhook(drop_pending_updates=False)
        logger.info('Webhook removed successfully.')
    else:
        logger.info('No active webhook detected.')
    dp = Dispatcher()
    dp.include_router(router)
    await dp.start_polling(bot)


if __name__ == '__main__':
    asyncio.run(main())
