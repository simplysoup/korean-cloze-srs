import type { TeachingGuide } from './types';

/** Beginner-friendly Level 2 grammar explanations and productive worked reasoning. */
export const level2Guides: Record<string, TeachingGuide> = {
  "gp_eulkkayo": {
    "meaning": "Use -(으)ㄹ까요? to ask for a suggestion or offer to decide together: 'Shall we...?' or 'Should I...?'.",
    "formation": "Take the verb stem. Use 을까요 after most consonant-ending stems and ㄹ까요 after vowel-ending stems: 가다 → 갈까요?",
    "worked": "같이 갈까요? asks 'Shall we go together?' It invites the listener into the decision.",
    "trap": "This is not just an ordinary future question. 갈 거예요? asks about a plan; 갈까요? asks for a suggestion or opinion."
  },
  "gp_eullaeyo": {
    "meaning": "Use -(으)ㄹ래요 to express what YOU would like to do or ask what the listener would like to do.",
    "formation": "Take the action stem. Add 을래요 after most consonant stems or ㄹ래요 after vowel stems: 마시다 → 마실래요.",
    "worked": "저는 차를 마실래요 says 'I'd like to have tea', expressing a personal choice.",
    "trap": "A speaker's preference differs from a fixed future plan. Don't use this form to assert another person's wishes as if you could know them."
  },
  "gp_euryeogo_hada": {
    "meaning": "Use -(으)려고 하다 to say you intend or plan to do something.",
    "formation": "Add 으려고 after most consonant stems, 려고 after vowel stems, and then 해요: 공부하다 → 공부하려고 해요.",
    "worked": "내일 한국어를 공부하려고 해요: the speaker intends to study Korean tomorrow.",
    "trap": "Planning to do something is different from doing it now. Don't treat -려고 하다 as the ongoing-action marker -고 있다."
  },
  "gp_eureo_gada": {
    "meaning": "Use -(으)러 가다/오다 to say you go or come somewhere for a PURPOSE: 'go to eat', 'come to study'.",
    "formation": "Add 으러 after most consonant stems or 러 after vowel stems, then 가요/와요: 먹다 → 먹으러 가요.",
    "worked": "밥을 먹으러 가요 means going somewhere in order to eat a meal.",
    "trap": "This pattern goes with movement verbs such as 가다 or 오다. It does not work as a general connector for every action."
  },
  "gp_eupsida": {
    "meaning": "Use -(으)ㅂ시다 for 'Let's...', a suggestion to do something together in formal polite speech.",
    "formation": "After a vowel-ending stem add ㅂ시다; after most consonant stems add 읍시다: 가다 → 갑시다, 먹다 → 먹읍시다.",
    "worked": "이제 갑시다 means 'Let's go now', including the speaker in the proposed action.",
    "trap": "It is more formal or forceful than -(으)ㄹ까요?; it may sound too direct in relaxed conversation."
  },
  "gp_seumnida": {
    "meaning": "Use -ㅂ니다/-습니다 for a FORMAL statement about an action or description, such as an announcement.",
    "formation": "Drop 다 from the verb or adjective. Add ㅂ니다 after a vowel stem or 습니다 after most consonant stems: 가다 → 갑니다, 먹다 → 먹습니다.",
    "worked": "저는 매일 한국어를 공부합니다: 공부하 + ㅂ니다 → 공부합니다, expressing a regular action formally.",
    "trap": "Noun identity needs the copula 입니다, not an action-verb stem ending pasted onto a noun. ㄹ-final stems also lose ㄹ before ㅂ니다."
  },
  "gp_seumnikka": {
    "meaning": "Use -ㅂ니까/-습니까? for a FORMAL question about an action or description.",
    "formation": "Drop 다, then add ㅂ니까 after a vowel stem or 습니까 after most consonant stems: 가다 → 갑니까?",
    "worked": "지금 어디에 갑니까? is a formal way to ask 'Where are you going now?'.",
    "trap": "Noun questions use N입니까? ('Are you a student?'). Do not try to turn a noun into a verb by adding -ㅂ니까."
  },
  "gp_imnida_imnikka": {
    "meaning": "Use 입니다 for 'is/am/are' with a NOUN in formal polite speech, and 입니까? for a question.",
    "formation": "Attach 입니다 or 입니까? directly to the noun: 학생 + 입니다 = 학생입니다; 학생 + 입니까? = 학생입니까?",
    "worked": "저는 학생입니다 is 'I am a student' in formal speech, compared with 저는 학생이에요 in everyday polite speech.",
    "trap": "Don't confuse 입니다 (noun identification) with -ㅂ니다/-습니다 (an action or descriptive verb's formal ending)."
  },
  "gp_eodo_doeda": {
    "meaning": "Use -아/어도 되다 to ask for or give permission: 'May I...?' or 'It's okay to...'.",
    "formation": "First make the action's 아/어 form: 앉다 → 앉아. Then add 도 돼요: 앉아도 돼요, literally saying that sitting is okay.",
    "worked": "여기 앉아도 돼요? asks whether sitting here is allowed. 앉아도 is the possible action; 돼요? asks whether it is acceptable.",
    "trap": "돼요 is the correct spelling of 되어요 here, not 되요. Compare permission with obligation -아/어야 해요."
  },
  "gp_eumyeon_an_doeda": {
    "meaning": "Use -(으)면 안 되다 to say an action is NOT allowed: 'must not' or 'shouldn't'.",
    "formation": "Add 으면 or 면 to the verb stem, then 안 돼요: 늦다 → 늦으면 안 돼요.",
    "worked": "여기에서 담배를 피우면 안 돼요: 피우다 → 피우면 names the condition 'if you smoke'. 안 돼요 marks that action as not allowed.",
    "trap": "This is stronger than not wanting to do it (안). Don't confuse 'must not' with 'don't have to'."
  },
  "gp_ji_maseyo": {
    "meaning": "Use -지 마세요 to politely tell someone NOT to do an action: 'Please don't...'.",
    "formation": "Start with the action stem: 뛰다 → 뛰. Attach 지 마세요 to tell the other person politely not to do it: 뛰지 마세요.",
    "worked": "여기에서 뛰지 마세요 directly asks the listener not to run here.",
    "trap": "Don't use 안 + -세요 as the usual prohibition. -지 마세요 targets the listener; -(으)면 안 돼요 expresses a rule or prohibition."
  },
  "gp_gi_nominal": {
    "meaning": "-기 turns an action into a noun-like activity: 'reading', 'studying', or 'doing'. That lets you say you like or dislike an action.",
    "formation": "Attach 기 to a verb stem. Then add the particle the surrounding sentence needs: 읽기 + 를 = 읽기를.",
    "worked": "저는 책 읽기를 좋아해요: 책 읽기 ('reading books') becomes the thing that the speaker likes.",
    "trap": "The noun-like -기 is not the whole polite sentence ending. To say 'before doing', add 전에 after -기: 먹기 전에."
  },
  "gp_go_naseo": {
    "meaning": "Use -고 나서 to make it clear that one action FINISHES before another begins.",
    "formation": "Add 고 나서 to the first action stem, then state the next action: 먹다 → 먹고 나서.",
    "worked": "밥을 먹고 나서 커피를 마셔요: 먹다 becomes 먹고 나서, meaning the meal is finished first. Coffee comes afterward.",
    "trap": "Plain -고 can simply join actions; -고 나서 stresses the first is completed. Don't use it as if the actions happen together."
  },
  "gp_eun_hue": {
    "meaning": "Use -(으)ㄴ 후에 to say 'after doing an action'. The action before 후에 is treated as completed.",
    "formation": "Make the completed-action modifier: 먹다 → 먹은, 하다 → 한; then add 후에.",
    "worked": "밥을 먹은 후에 약을 먹어요: after eating, the person takes medicine.",
    "trap": "수업 후에 is 'after class' with a noun. With a verb, don't attach 후에 directly to the bare stem: 먹후에 is wrong."
  },
  "gp_gi_jeone": {
    "meaning": "Use -기 전에 to say one action happens before another action. The first action is treated like an event you can refer to.",
    "formation": "Remove 다 from the verb, add 기, then put 전에 after it: 자다 → 자기 전에. Continue with the earlier action.",
    "worked": "자기 전에 이를 닦아요: 자다 ('sleep') becomes 자기, and 전에 means 'before'. Toothbrushing happens before sleep.",
    "trap": "Don't confuse 전에 after a noun (수업 전에) with verb + 기 전에 (먹기 전에)."
  },
  "gp_eul_ttae": {
    "meaning": "Use -(으)ㄹ 때 to say 'when' an action happens or a situation holds.",
    "formation": "Add 을 때 after most consonant stems or ㄹ 때 after vowel stems: 가다 → 갈 때.",
    "worked": "집에 갈 때 버스를 타요: when going home, the speaker takes the bus.",
    "trap": "This does not always mean a future event despite ㄹ. Context can make it habitual or present; keep 때 separate."
  },
  "gp_go_itda": {
    "meaning": "Use -고 있다 for an action that is in progress: 'am reading', 'is studying'.",
    "formation": "Take the action stem, attach 고, and add 있어요: 읽다 → 읽고 있어요.",
    "worked": "지금 책을 읽고 있어요: 읽다 becomes 읽고, followed by 있어요. The two-part form shows that reading is happening now.",
    "trap": "Don't automatically use it for every English '-ing'. Some Korean verbs describe states, and their natural ongoing forms may differ."
  },
  "gp_neun_jung": {
    "meaning": "Use -는 중이다 to emphasize that someone is currently busy doing an action. It feels like 'in the middle of doing it'.",
    "formation": "Make the present action modifier -는, then add 중이에요: 공부하다 → 공부하는 중이에요.",
    "worked": "지금 공부하는 중이에요: 공부하다 becomes 공부하는, followed by 중이에요. Together they emphasize being in the middle of studying.",
    "trap": "중 is a separate noun-like word. Contrast -고 있어요 (ongoing action) with -는 중이에요 (busy in the middle of it)."
  },
  "gp_geona": {
    "meaning": "Use -거나 to present two possible ACTIONS or states: 'do A or do B'.",
    "formation": "Attach 거나 to the first verb or descriptive-verb stem, then state the alternative: 읽다 → 읽거나.",
    "worked": "주말에는 책을 읽거나 영화를 봐요: on weekends, the speaker reads books or watches films.",
    "trap": "For a choice between NOUNS, use (이)나. Don't put -거나 between simple nouns."
  },
  "gp_ina_choice": {
    "meaning": "Use (이)나 to connect alternative NOUNS: 'coffee or tea'.",
    "formation": "After a noun ending in a consonant, use 이나; after a vowel, use 나: 책이나, 커피나.",
    "worked": "커피나 차를 마실래요? asks if the listener would like coffee or tea.",
    "trap": "Verb alternatives use -거나. (이)나 can also mean 'at least/around' in other contexts; this point teaches noun choice."
  },
  "gp_neun_modifier": {
    "meaning": "Use -는 before a noun to describe someone or something by an ACTION happening now or habitually: 'the person who reads'.",
    "formation": "Add 는 to the action-verb stem, then put the noun right after it: 읽다 → 읽는 사람.",
    "worked": "책을 읽는 사람: 읽는 describes 사람, the person doing the reading.",
    "trap": "Descriptive verbs like 크다 normally use 큰, not 크는. Past action modifiers use -(으)ㄴ instead."
  },
  "gp_eun_past_modifier": {
    "meaning": "Use -(으)ㄴ before a noun for an action that is already done: 'the clothes I bought'.",
    "formation": "For action verbs, add 은 after many consonant stems or ㄴ after vowel stems: 사다 → 산, 먹다 → 먹은.",
    "worked": "어제 산 옷: 산 is 'bought', describing the clothes purchased yesterday.",
    "trap": "This looks like the adjective modifier -(으)ㄴ, but the meaning is different: for actions it points to completed action."
  },
  "gp_eul_future_modifier": {
    "meaning": "Use -(으)ㄹ before a noun to describe something you will do or plan to do: 'a person I will meet'.",
    "formation": "Add 을 after many consonant stems, ㄹ after vowel stems, then the noun: 만나다 → 만날 사람.",
    "worked": "내일 만날 사람: 만날 describes the person the speaker will meet tomorrow.",
    "trap": "This does not by itself finish a future-tense sentence. It modifies the noun that follows."
  },
  "gp_neun_geot": {
    "meaning": "Use -는 것 to refer to DOING an action as a thing or activity: 'reading books' or 'getting up early'.",
    "formation": "Attach 는 to an action verb and put 것 after it; add an object/subject particle if the outer sentence needs one: 읽는 것을.",
    "worked": "저는 책을 읽는 것을 좋아해요: 'reading books' is the activity the speaker likes.",
    "trap": "것 is a separate word, and -는 것 differs from plain -기 in nuance and where each fits in a sentence."
  },
  "gp_eoboda": {
    "meaning": "Use -아/어 보다 to mean 'try doing something' or 'have tried it'.",
    "formation": "Take the verb's 아/어 form and add 보다: 먹다 → 먹어 보다 → 먹어 보세요.",
    "worked": "이 음식을 먹어 보세요: 먹다 becomes 먹어; 보세요 politely invites the listener to TRY the food, not simply to look at it.",
    "trap": "This auxiliary 보다 is not the verb 'to see' used literally. The spacing 먹어 보다 is a safe teaching default."
  },
  "gp_eun_jeok": {
    "meaning": "Use -(으)ㄴ 적이 있다 to say you have done something at some time in your life.",
    "formation": "Make the completed-action modifier and add 적이 있어요: 가다 → 간 적이 있어요.",
    "worked": "한국에 간 적이 있어요 means 'I've been to Korea before' (there was a time I went).",
    "trap": "Don't confuse past experience with a specific past event. 갔어요 states that you went; 간 적이 있어요 emphasizes having that experience."
  },
  "gp_eobon_jeok": {
    "meaning": "Use -아/어 본 적이 있다 to say you have experienced TRYING an action before.",
    "formation": "Make the 아/어 보다 auxiliary into its past modifier: 먹어 보다 → 먹어 본, then 적이 있어요.",
    "worked": "김치를 먹어 본 적이 있어요: 먹다 → 먹어 보다 → 먹어 본. The phrase 적이 있어요 says the speaker has had that experience.",
    "trap": "본 refers to having tried an action; don't translate it as literally seeing something with your eyes."
  },
  "gp_giro_hada": {
    "meaning": "Use -기로 하다 when you decide or agree to do something: 'decided to'.",
    "formation": "Add 기로 to the action stem, then 하다 in the right tense: 운동하다 → 운동하기로 했어요.",
    "worked": "내일부터 운동하기로 했어요 says the speaker made a decision to start exercising tomorrow.",
    "trap": "This is a decision, not just a possible plan. Compare 공부하려고 해요 (intend to study) with 공부하기로 했어요 (decided to study)."
  },
  "gp_eul_geot_gatda": {
    "meaning": "Use -(으)ㄹ 것 같다 to express a guess or prediction: 'I think it will...' or 'It seems likely...'.",
    "formation": "Make the -(으)ㄹ form of the verb first: 오다 → 올. Then add the separate words 것 같아요 to express a prediction.",
    "worked": "내일 비가 올 것 같아요 is a prediction that rain will come tomorrow.",
    "trap": "Don't confuse this with -(으)ㄴ 것 같아요 for a present descriptive state. The form before 것 changes with what you are judging."
  },
  "gp_gi_ttaemune": {
    "meaning": "Use -기 때문에 to state a reason: 'because of doing X' or 'because X happens'.",
    "formation": "Add 기 때문에 to a verb/adjective stem, then state the result: 오다 → 오기 때문에.",
    "worked": "비가 오기 때문에 집에 있어요: rain is the reason the speaker stays home.",
    "trap": "때문에 often sounds more explanatory or formal than everyday -아/어서. Nouns typically use N 때문에 without -기."
  },
  "gp_neunde": {
    "meaning": "Use -는데 after an ACTION verb to give background, create contrast, or lead into what comes next.",
    "formation": "For a present action verb, remove 다 and attach 는데: 오다 → 오는데. Then follow with the new information or contrast.",
    "worked": "비가 오는데 우산이 없어요: it is raining, and the speaker provides the background for having no umbrella.",
    "trap": "-는데 is not always English 'but'. Sometimes it introduces a situation or gently sets up a request; descriptive verbs take another form."
  },
  "gp_eunde": {
    "meaning": "Use -(으)ㄴ데 after most descriptive verbs (adjectives) to give background or set up a contrast.",
    "formation": "Add 은데 after many consonant-ending descriptive stems and ㄴ데 after vowels: 춥다 → 추운데 (irregular).",
    "worked": "날씨가 추운데 밖에 갈까요? gives 'it's cold' as background before suggesting going out.",
    "trap": "Action verbs normally use -는데. Watch irregular descriptive stems such as 춥다 → 추운데 rather than a mechanical 춥은데."
  },
  "gp_inde": {
    "meaning": "Use -(이)ㄴ데 after a NOUN to say 'it's X, and/but...' while providing background or a contrast.",
    "formation": "After a consonant-ending noun, use 인데; after a vowel noun, use ㄴ데: 일요일 → 일요일인데.",
    "worked": "오늘은 일요일인데 회사에 가요: although today is Sunday, someone is going to work.",
    "trap": "This attaches to nouns, not verbs. Choose -는데 for action verbs and -(으)ㄴ데 for descriptive verbs."
  },
  "gp_eumyeonseo": {
    "meaning": "Use -(으)면서 for actions happening at the same time: 'while doing A, do B'.",
    "formation": "Add 으면서 after most consonant stems or 면서 after vowel stems: 듣다 → 들으면서 (ㄷ irregular).",
    "worked": "음악을 들으면서 공부해요: the speaker studies while listening to music.",
    "trap": "Normally the two actions share a subject. If different people do the two actions, another structure may be more natural."
  },
  "gp_eojida": {
    "meaning": "Use -아/어지다 to describe a change in a quality: 'become colder', 'get easier'.",
    "formation": "Take a descriptive stem and add 아/어지다: 춥다 → 추워지다 → 추워졌어요.",
    "worked": "날씨가 많이 추워졌어요: 춥다 becomes 추워지다 ('grow cold'), then 추워졌어요 in the past. The weather changed into a colder state.",
    "trap": "Don't confuse change in a state (-아/어지다) with a change of circumstances leading someone to do something (-게 되다)."
  },
  "gp_ge_adverb": {
    "meaning": "-게 changes many descriptive verbs into a way of DOING an action: 'quietly', 'clearly', 'carefully'.",
    "formation": "Attach 게 to the descriptive-verb stem, then put it before the action: 조용하다 → 조용하게.",
    "worked": "조용하게 말해 주세요: 조용하다 ('quiet') becomes 조용하게 ('quietly'). That word explains HOW the speaking should happen.",
    "trap": "Not every English '-ly' translates mechanically to -게, and this -게 is different from the -게 in -게 되다."
  },
  "gp_ge_doeda": {
    "meaning": "Use -게 되다 when circumstances change and an action ends up happening or becoming the new situation.",
    "formation": "Attach 게 되다 to an action-verb stem: 살다 → 살게 되다 → 살게 됐어요.",
    "worked": "다음 달부터 서울에서 살게 됐어요: something happened or was decided so living in Seoul is now the outcome.",
    "trap": "It is not simply a neutral future-tense ending. It often emphasizes how the situation turned out, not only a free choice."
  },
  "gp_eoduda": {
    "meaning": "Use -아/어 두다 when you do something now and leave the result ready for later.",
    "formation": "Take the action's 아/어 form and add 두다: 열다 → 열어 두다 → 열어 두세요.",
    "worked": "문을 열어 두세요: 열다 becomes 열어; 두세요 asks to keep the result in place. The door should remain open afterward.",
    "trap": "This is different from merely opening a door once. The important idea is preserving the result."
  },
  "gp_boda_compare": {
    "meaning": "보다 after a noun means 'than', giving the comparison point.",
    "formation": "Put 보다 after the item being compared AGAINST: 버스보다 지하철이 빨라요.",
    "worked": "버스보다 지하철이 빨라요: the subway is fastER THAN the bus; 버스 is the comparison standard.",
    "trap": "The particle 보다 here is not the verb 보다 ('to see'). 더 can emphasize 'more', but is not required for the comparison."
  },
  "gp_cheoreom": {
    "meaning": "처럼 after a noun means 'like' or 'as', comparing manner or resemblance.",
    "formation": "Put 처럼 right after the person or thing used as a model: 가수처럼.",
    "worked": "그 사람은 가수처럼 노래해요: 가수 means 'singer'. Adding 처럼 says the singing resembles that of a singer, without claiming the person is a singer.",
    "trap": "처럼 expresses resemblance, not a literal identity. For 'is a singer', use 가수예요."
  },
  "gp_euro_means": {
    "meaning": "(으)로 can mean 'by/using', 'through', 'in the direction of', or 'as', depending on context.",
    "formation": "Use 으로 after most consonant-ending nouns, 로 after vowel-ending nouns or nouns ending in ㄹ: 버스 → 버스로.",
    "worked": "버스로 학교에 가요 means the bus is the means of travel. 연필로 써요 uses a pencil as a tool.",
    "trap": "Don't pick 으로 after a final ㄹ: 서울로 is correct. Different meanings of (으)로 depend on the verb and situation."
  },
  "gp_mada": {
    "meaning": "마다 means 'every' for a recurring time or individual item.",
    "formation": "Choose the recurring time or group and attach 마다 directly: 아침마다, 주말마다, 사람마다. It means each occurrence or member.",
    "worked": "저는 아침마다 운동해요: 아침 is 'morning'. Adding 마다 makes the exercise a repeated habit, not just something done one morning.",
    "trap": "마다 implies repetition. It is different from 한 번 ('once') or 때마다 ('whenever') in more complex constructions."
  },
  "gp_bakke": {
    "meaning": "밖에 with a negative verb means 'only' or 'nothing but', often conveying less than expected.",
    "formation": "Attach 밖에 to the limited noun/amount and follow with a NEGATIVE such as 없어요: 천 원밖에 없어요.",
    "worked": "지갑에 천 원밖에 없어요: only 1,000 won is in the wallet; the following 없어요 is crucial.",
    "trap": "Without negative wording, 밖에 is usually wrong for this 'only' meaning. 만 is a more neutral 'only' and does not require negation."
  },
  "gp_eobeorida": {
    "meaning": "-아/어 버리다 means an action gets completely finished, often with feelings such as relief, regret, or surprise.",
    "formation": "Form the verb's 아/어 shape first: 하다 → 해. Then add 버리다 and conjugate it: 해 버렸어요 (finished doing it).",
    "worked": "숙제를 다 해 버렸어요 means the homework got finished completely; it can carry relief.",
    "trap": "It does not always mean a bad outcome. The emotion depends on context: finishing an unpleasant task may feel good."
  },
  "gp_eodo_concession": {
    "meaning": "-아/어도 means 'even if' or 'although', saying the next result still happens.",
    "formation": "Add 아/어도 to the first clause and state the unchanged outcome: 오다 → 와도.",
    "worked": "비가 와도 가요: 오다 becomes 와도 ('even if it rains'). The main action 가요 still happens despite that condition.",
    "trap": "Do not confuse concession -아/어도 with permission -아/어도 돼요. The following words determine the meaning."
  },
  "gp_geureonde": {
    "meaning": "그런데 connects sentences as 'but', 'by the way', or 'however', often shifting direction or topic.",
    "formation": "Finish the first sentence, then start the next one with 그런데.",
    "worked": "오늘은 추워요. 그런데 코트가 없어요: it's cold, but the speaker has no coat.",
    "trap": "그런데 can also change topics gently. It's not a verb suffix; contrast하지만, which more directly marks opposition."
  },
  "gp_go_nan_hue": {
    "meaning": "-고 난 후에 means 'after finishing an action', emphasizing that the action is already done.",
    "formation": "Add 고 난 후에 to the first verb stem, then the next event: 운동하다 → 운동하고 난 후에.",
    "worked": "운동하고 난 후에 물을 마셔요: drink water after working out is finished.",
    "trap": "Do not treat it as a second unrelated 'after' word: compare -고 나서, which often expresses the same sequence more simply."
  },
  "gp_aseo_sequence": {
    "meaning": "-아/어서 can also link a first action to a next one: 'do A and then B'. Here it is SEQUENCE, not 'because'.",
    "formation": "Add 아서/어서 to the first verb stem; continue with a natural next action: 일어나다 → 일어나서.",
    "worked": "아침에 일어나서 세수해요: 일어나다 becomes 일어나서. Getting up comes first; washing up follows as a natural next action.",
    "trap": "Don't confuse sequential -아/어서 with causal -아/어서; the full sentence's meaning determines whether you hear 'and then' or 'because'."
  },
  "gp_neundago_hada": {
    "meaning": "Use -ㄴ/는다고 하다 to report what someone says about an ACTION: 'They say that...'.",
    "formation": "For a present action verb, add ㄴ다고 after vowel stems or 는다고 after consonant stems, then 해요: 운동하다 → 운동한다고 해요.",
    "worked": "친구가 매일 운동한다고 해요 reports that the friend says they exercise daily.",
    "trap": "Descriptive verbs usually use -다고, and nouns use -(이)라고; don't use the action-verb form for everything."
  },
  "gp_dago_hada_adj": {
    "meaning": "Use -다고 하다 to report what someone says about a DESCRIPTION or state: 'They say it's busy'.",
    "formation": "Attach 다고 to a descriptive-verb stem and add 해요: 바쁘다 → 바쁘다고 해요.",
    "worked": "친구가 오늘 바쁘다고 해요: the friend reportedly says they are busy today.",
    "trap": "For action verbs use -ㄴ/는다고, and for nouns use -(이)라고. This lesson is a beyond-core-beginner bridge."
  },
  "gp_irago_hada": {
    "meaning": "Use -(이)라고 하다 to report a noun identity or give a name: 'I am called...' or 'They say it's...'.",
    "formation": "After a noun ending in a consonant, use 이라고; after a vowel, 라고: 민수 → 민수라고.",
    "worked": "저는 민수라고 해요 is a common way to introduce one's name, literally 'I'm called Minsu'.",
    "trap": "Don't use action-verb -ㄴ/는다고 after a noun. The noun's final consonant determines 이라고 vs 라고."
  },
  "gp_dagoyo": {
    "meaning": "-다고요? repeats or checks something heard, often with surprise: 'You said...?' or 'Really...?'.",
    "formation": "Repeat the reported content and end with 다고요? For actions, you may see ㄴ/는다고요?; for descriptions, 다고요?.",
    "worked": "내일 비가 온다고요? shows surprise or confirmation: 'You mean it's going to rain tomorrow?'",
    "trap": "This can sound challenging or sharp depending on tone. It is not the default friendly way to ask a neutral question."
  }
};
