import type { ClozeCardSeed, EnglishHintPart, LessonExampleSeed } from '../types';

interface Additions {
	examples?: LessonExampleSeed[];
	cards?: ClozeCardSeed[];
}

/** Split a translation on the first word-boundary occurrence of `word`,
 * marking it 'direct' — the English word for the blanked Korean grammar.
 * Instruction-style hints (no word to highlight) keep a single
 * unhighlighted part. */
function highlightParts(translation: string, word?: string): EnglishHintPart[] {
	if (!word) return [{ text: translation, highlightType: 'none' }];
	const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const tail = /\w$/.test(word) ? '\\b' : '';
	const m = new RegExp('\\b' + escaped + tail).exec(translation);
	if (!m) return [{ text: translation, highlightType: 'none' }];
	const parts: EnglishHintPart[] = [];
	if (m.index > 0) parts.push({ text: translation.slice(0, m.index), highlightType: 'none' });
	parts.push({ text: m[0], highlightType: 'direct' });
	const end = m.index + m[0].length;
	if (end < translation.length) parts.push({ text: translation.slice(end), highlightType: 'none' });
	return parts;
}

function worked(id: string, blank: string, answer: string, translation: string, order: number, notes: string, highlight?: string): LessonExampleSeed {
	return {
		id: `le_${id}`, fullSentence: blank.replace('___', answer), sentenceWithBlank: blank,
		answer, englishHint: highlightParts(translation, highlight), order, notes
	};
}

function practice(id: string, blank: string, answer: string, translation: string, position: number, baseForm = '', highlight?: string): ClozeCardSeed {
	return {
		id: `cc_${id}`, fullSentence: blank.replace('___', answer), sentenceWithBlank: blank,
		answer, alternateAnswers: [], vocabBaseForm: baseForm, introducedAtPosition: position,
		englishHint: highlightParts(translation, highlight)
	};
}

export const level1Additions: Record<string, Additions> = {
	gp_ieyo_yeyo: {
		examples: [worked('ieyo_repair', '이것은 책___.', '이에요', 'This is a book.', 2, '책 ends in ㄱ, so use 이에요. Compare 의자예요, where 의자 ends in a vowel. For “is not,” learn the separate form 아니에요.', 'is')],
		cards: [
			practice('ieyo_variant_book', '저것은 책___.', '이에요', 'That over there is a book.', 1, '', 'is'),
			practice('ieyo_variant_desk', '이것은 의자___.', '예요', 'This is a chair.', 1, '', 'is')
		]
	},
	gp_eun_neun: {
		examples: [worked('topic_contrast', '커피___ 마셔요. 차는 안 마셔요.', '는', 'I drink coffee. As for tea, I don’t drink it.', 2, '는 contrasts coffee with tea. The contrast comes from the two sentences together.', 'As for tea')],
		cards: [practice('topic_variant_weekend', '토요일___ 쉬어요. 일요일에는 일해요.', '은', 'I rest on Saturdays. On Sundays I work. Make Saturday the contrasting topic.', 3)]
	},
	gp_i_ga: {
		examples: [worked('subject_identification', '누가 왔어요? 친구___ 왔어요.', '가', 'Who came? A friend came.', 2, '가 identifies the person who came. 누가 means “who” as the subject.', 'A friend')],
		cards: [practice('subject_variant_who', '누가 전화했어요? 선생님___ 전화했어요.', '이', 'Who called? The teacher called. Identify who did it.', 9)]
	},
	gp_ayo_eoyo: {
		examples: [worked('present_contraction', '영화를 ___.', '봐요', 'I watch a movie.', 3, '보다 → 봐요. The stem 보 and 아 combine to make 봐.', 'watch')],
		cards: [
			practice('present_variant_sit', '여기 ___.', '앉아요', 'I sit here.', 11, '앉다', 'sit'),
			practice('present_variant_read', '신문을 읽___.', '어요', 'I read the newspaper.', 11, '읽다', 'read'),
			practice('present_variant_exercise', '매일 운동___.', '해요', 'I exercise every day.', 11, '운동하다', 'exercise')
		]
	},
	gp_an: {
		cards: [practice('short_negative_variant', '오늘은 커피를 ___ 마셔요.', '안', 'Today I don’t drink coffee. Use the short negative form.', 12)]
	},
	gp_hago: {
		cards: [{ ...practice('and_variant', '우유___ 빵을 사요.', '하고', 'I buy milk and bread.', 13, '', 'and'), alternateAnswers: ['와', '랑'] }]
	},
	gp_yeogi: {
		cards: [practice('here_variant', '___에 책을 놓아요.', '여기', 'I put the book here, next to me.', 14, '', 'here')]
	},
	gp_geogi: {
		cards: [practice('there_variant', '___에 뭐가 있어요?', '거기', 'What is there where you are?', 15, '', 'there')]
	},
	gp_jeogi: {
		cards: [practice('over_there_variant', '___에 은행이 있어요.', '저기', 'There is a bank over there away from both of us.', 16, '', 'over there')]
	},
	gp_e_loc: {
		examples: [
			worked('e_library_destination', '도서관___ 가요.', '에', 'I go to the library.', 2, 'The library is the destination. Compare 도서관에서 공부해요, where the library is the place of the action.', 'to'),
			worked('e_library_existence', '도서관___ 있어요.', '에', 'I am at the library.', 3, '있어요 tells you where someone or something is.', 'at')
		],
		cards: [
			{ ...practice('e_variant_park', '공원___ 가요.', '에', 'I go to the park.', 19, '', 'to'), alternateAnswers: ['으로'] },
			practice('e_variant_school', '친구가 학교___ 있어요.', '에', 'My friend is at school.', 19, '', 'at'),
			{ ...practice('e_variant_store', '가게___ 가요.', '에', 'I go to the store.', 19, '', 'to'), alternateAnswers: ['로'] }
		]
	},
	gp_isseoyo: {
		cards: [practice('existence_variant', '가방에 책이 ___.', '있어요', 'There is a book in the bag.', 20, '있다', 'is')]
	},
	gp_eseo: {
		examples: [worked('eseo_library_action', '도서관___ 책을 읽어요.', '에서', 'I read a book at the library.', 2, 'Reading is the action. The library tells you where it happens.', 'at')],
		cards: [
			practice('eseo_variant_park', '공원___ 운동해요.', '에서', 'I exercise at the park.', 22, '', 'at'),
			practice('eseo_variant_home', '집___ 밥을 먹어요.', '에서', 'I eat at home.', 22, '', 'at'),
			practice('eseo_variant_school', '학교___ 한국어를 배워요.', '에서', 'I learn Korean at school.', 22, '', 'at')
		]
	},
	gp_position: {
		examples: [worked('position_behind', '집 ___에 나무가 있어요.', '뒤', 'There is a tree behind the house.', 2, '집 뒤에 literally puts the house first, then “behind,” then the location particle.', 'behind')],
		cards: [practice('position_behind_variant', '학교 ___에 공원이 있어요.', '뒤', 'There is a park behind the school.', 23, '', 'behind')]
	},
	gp_asseoyo: {
		examples: [worked('past_contraction', '영화를 ___.', '봤어요', 'I watched a movie.', 3, '보다 → 봤어요. 보 and 았 combine to make 봤.', 'watched')],
		cards: [practice('past_variant_sit', '여기 ___.', '앉았어요', 'I sat here.', 29, '앉다', 'sat')]
	},
	gp_eul_su_issda: {
		examples: [worked('ability_negative', '수영할 ___ 없어요.', '수', 'I can’t swim.', 2, '없어요 gives the negative meaning. 수 is separated from the verb by a space.', 'can’t')],
		cards: [
			practice('ability_negative_variant', '오늘은 갈 ___.', '수 없어요', 'I can’t go today. Use the 수 pattern.', 35),
			practice('ability_conjugation_variant', '빵을 ___ 수 있어요.', '만들', 'I can make bread.', 35, '만들다', 'can')
		]
	},
	gp_eulgeyo: {
		examples: [worked('future_offer', '짐이 무거워요? 제가 들어 ___.', '줄게요', 'Is your bag heavy? I’ll carry it for you.', 2, 'The speaker offers to do something for the listener.', 'I’ll carry it')],
		cards: [practice('future_offer_variant', '문을 열까요? 제가 ___.', '열게요', 'Shall I open the door? I’ll open it. Make an offer to the listener.', 47, '열다')]
	}
};
