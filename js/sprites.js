/**
 * UNDERTALE: LAST BREATH - SPRITE LOADER & MANAGER
 * Full sprite manifest with all extracted sprites from Last Breath
 */

class SpriteManager {
  constructor() {
    this.images = {};
    this.loadedCount = 0;
    this.totalCount = 0;
    this.ready = false;

    this.manifest = {
      // ── SOUL ──
      soul_red:   'spr_battle_soul_0.png',
      soul_blue:  'spr_battle_soul_1.png',
      soul_break_0: 'spr_battle_soul_break_0.png',
      soul_break_1: 'spr_battle_soul_break_1.png',
      soul_piece_0: 'spr_battle_soul_piece_0.png',
      soul_piece_1: 'spr_battle_soul_piece_1.png',
      soul_piece_2: 'spr_battle_soul_piece_2.png',
      soul_piece_3: 'spr_battle_soul_piece_3.png',
      soul_flee_0: 'spr_battle_soul_flee_0.png',
      soul_flee_1: 'spr_battle_soul_flee_1.png',

      // ── ACTION BUTTONS ──
      btn_fight_0: 'spr_button_fight_0.png',
      btn_fight_1: 'spr_button_fight_1.png',
      btn_act_0: 'spr_button_act_0.png',
      btn_act_1: 'spr_button_act_1.png',
      btn_item_0: 'spr_button_item_0.png',
      btn_item_1: 'spr_button_item_1.png',
      btn_mercy_0: 'spr_button_mercy_0.png',
      btn_mercy_1: 'spr_button_mercy_1.png',
      btn_nomercy_0: 'spr_button_nomercylb_0.png',
      btn_nomercy_1: 'spr_button_nomercylb_1.png',
      btn_mercypiece_0: 'spr_button_mercypiece_0.png',
      btn_mercypiece_1: 'spr_button_mercypiece_1.png',
      btn_nofight: 'spr_button_nofight.png',
      btn_noitem: 'spr_button_noitem.png',
      btn_nomercy_single: 'spr_button_nomercy_0.png',
      btn_effect0_0: 'spr_button_effect0_0.png',
      btn_effect0_1: 'spr_button_effect0_1.png',
      btn_effect0_2: 'spr_button_effect0_2.png',
      btn_effect1_0: 'spr_button_effect1_0.png',
      btn_effect1_1: 'spr_button_effect1_1.png',

      // ── FACE / EXPRESSION ──
      face_0: 'spr_face_sans0.png',
      face_1: 'spr_face_sans1.png',
      face_2: 'spr_face_sans2.png',
      face_3: 'spr_face_sans3.png',
      face_4: 'spr_face_sans4.png',
      face_5: 'spr_face_sans5.png',
      face_6: 'spr_face_sans6.png',
      face_7: 'spr_face_sans7.png',
      face_8_0: 'spr_face_sans8_0.png',
      face_8_1: 'spr_face_sans8_1.png',
      face_9: 'spr_face_sans9.png',

      // ── SANS IDLE (punchsans = main idle in LB) ──
      sans_idle_0:  'spr_punchsans_0.png',
      sans_idle_1:  'spr_punchsans_1.png',
      sans_idle_2:  'spr_punchsans_2.png',
      sans_idle_3:  'spr_punchsans_3.png',
      sans_idle_4:  'spr_punchsans_4.png',
      sans_idle_5:  'spr_punchsans_5.png',
      sans_idle_6:  'spr_punchsans_6.png',
      sans_idle_7:  'spr_punchsans_7.png',
      sans_idle_8:  'spr_punchsans_8.png',
      sans_idle_9:  'spr_punchsans_9.png',
      sans_idle_10: 'spr_punchsans_10.png',
      sans_idle_11: 'spr_punchsans_11.png',
      sans_idle_12: 'spr_punchsans_12.png',
      sans_idle_13: 'spr_punchsans_13.png',
      sans_idle_14: 'spr_punchsans_14.png',
      sans_idle_15: 'spr_punchsans_15.png',
      sans_idle_16: 'spr_punchsans_16.png',
      sans_idle_17: 'spr_punchsans_17.png',
      sans_idle_18: 'spr_punchsans_18.png',
      sans_idle_19: 'spr_punchsans_19.png',
      sans_idle_20: 'spr_punchsans_20.png',
      sans_idle_21: 'spr_punchsans_21.png',
      sans_idle_22: 'spr_punchsans_22.png',
      sans_idle_23: 'spr_punchsans_23.png',
      sans_idle_24: 'spr_punchsans_24.png',
      sans_idle_25: 'spr_punchsans_25.png',
      sans_idle_26: 'spr_punchsans_26.png',
      sans_idle_27: 'spr_punchsans_27.png',
      sans_idle_28: 'spr_punchsans_28.png',
      sans_idle_29: 'spr_punchsans_29.png',
      sans_idle_30: 'spr_punchsans_30.png',
      sans_idle_31: 'spr_punchsans_31.png',
      sans_idle_32: 'spr_punchsans_32.png',
      sans_idle_33: 'spr_punchsans_33.png',
      sans_idle_34: 'spr_punchsans_34.png',
      sans_idle_35: 'spr_punchsans_35.png',
      sans_idle_36: 'spr_punchsans_36.png',
      sans_idle_37: 'spr_punchsans_37.png',
      sans_idle_38: 'spr_punchsans_38.png',
      sans_idle_39: 'spr_punchsans_39.png',
      sans_idle_40: 'spr_punchsans_40.png',
      sans_idle_41: 'spr_punchsans_41.png',

      // ── SANS TIRED IDLE (Phase 2 exhausted) ──
      sans_tired_0:  'spr_sansthrowtired_0.png',
      sans_tired_1:  'spr_sansthrowtired_1.png',
      sans_tired_2:  'spr_sansthrowtired_2.png',
      sans_tired_3:  'spr_sansthrowtired_3.png',
      sans_tired_4:  'spr_sansthrowtired_4.png',
      sans_tired_5:  'spr_sansthrowtired_5.png',
      sans_tired_6:  'spr_sansthrowtired_6.png',
      sans_tired_7:  'spr_sansthrowtired_7.png',
      sans_tired_8:  'spr_sansthrowtired_8.png',
      sans_tired_9:  'spr_sansthrowtired_9.png',
      sans_tired_10: 'spr_sansthrowtired_10.png',
      sans_tired_11: 'spr_sansthrowtired_11.png',
      sans_tired_12: 'spr_sansthrowtired_12.png',
      sans_tired_13: 'spr_sansthrowtired_13.png',
      sans_tired_14: 'spr_sansthrowtired_14.png',
      sans_tired_15: 'spr_sansthrowtired_15.png',
      sans_tired_16: 'spr_sansthrowtired_16.png',
      sans_tired_17: 'spr_sansthrowtired_17.png',
      sans_tired_18: 'spr_sansthrowtired_18.png',

      // ── SANS THROW / BOARD ATTACK ──
      sans_throw_0:  'spr_sanstrhowboard_0.png',
      sans_throw_1:  'spr_sanstrhowboard_1.png',
      sans_throw_2:  'spr_sanstrhowboard_2.png',
      sans_throw_3:  'spr_sanstrhowboard_3.png',
      sans_throw_4:  'spr_sanstrhowboard_4.png',
      sans_throw_5:  'spr_sanstrhowboard_5.png',
      sans_throw_6:  'spr_sanstrhowboard_6.png',
      sans_throw_7:  'spr_sanstrhowboard_7.png',
      sans_throw_8:  'spr_sanstrhowboard_8.png',
      sans_throw_9:  'spr_sanstrhowboard_9.png',
      sans_attack_board_0:  'spr_sansattackboard_0.png',
      sans_attack_board_1:  'spr_sansattackboard_1.png',
      sans_attack_board_2:  'spr_sansattackboard_2.png',
      sans_attack_board_3:  'spr_sansattackboard_3.png',
      sans_attack_board_4:  'spr_sansattackboard_4.png',
      sans_attack_board_5:  'spr_sansattackboard_5.png',
      sans_attack_board_6:  'spr_sansattackboard_6.png',
      sans_attack_board_7:  'spr_sansattackboard_7.png',
      sans_attack_board_8:  'spr_sansattackboard_8.png',
      sans_attack_board_9:  'spr_sansattackboard_9.png',
      sans_attack_board_10: 'spr_sansattackboard_10.png',
      sans_attack_board_11: 'spr_sansattackboard_11.png',
      sans_attack_board_12: 'spr_sansattackboard_12.png',
      sans_attack_board_13: 'spr_sansattackboard_13.png',
      sans_attack_board_14: 'spr_sansattackboard_14.png',
      sans_attack_board_15: 'spr_sansattackboard_15.png',
      sans_attack_board_16: 'spr_sansattackboard_16.png',
      sans_upboard_0: 'spr_sansupboard_0.png',
      sans_upboard_1: 'spr_sansupboard_1.png',
      sans_upboard_2: 'spr_sansupboard_2.png',
      sans_upboard_3: 'spr_sansupboard_3.png',
      sans_upboard_4: 'spr_sansupboard_4.png',
      sans_upboard_5: 'spr_sansupboard_5.png',
      sans_upboard_6: 'spr_sansupboard_6.png',
      sans_upboard_7: 'spr_sansupboard_7.png',
      sans_upboard_8: 'spr_sansupboard_8.png',
      sans_upboard_9: 'spr_sansupboard_9.png',

      // ── SANS MISS / DODGE ──
      sans_missM_0:   'spr_p1missM_0.png',
      sans_missM_1:   'spr_p1missM_1.png',
      sans_missM1:    'spr_p1missM1.png',
      sans_missL0_0:  'spr_p1missL0_0.png',
      sans_missL0_1:  'spr_p1missL0_1.png',
      sans_missL0_2:  'spr_p1missL0_2.png',
      sans_missR0_0:  'spr_p1missR0_0.png',
      sans_missR0_1:  'spr_p1missR0_1.png',
      sans_missR0_2:  'spr_p1missR0_2.png',
      sans_missL1_0:  'spr_p1missL1_0.png',
      sans_missL1_1:  'spr_p1missL1_1.png',
      sans_missL1_2:  'spr_p1missL1_2.png',

      // ── SANS LAUGH ──
      sans_laugh_0: 'spr_sanslaught_0.png',
      sans_laugh_1: 'spr_sanslaught_1.png',
      sans_laugh_2: 'spr_sanslaught_2.png',
      sans_laugh1_0: 'spr_sanslaught1_0.png',
      sans_laugh1_1: 'spr_sanslaught1_1.png',
      sans_laugh1_2: 'spr_sanslaught1_2.png',
      sans_laugh1_3: 'spr_sanslaught1_3.png',

      // ── SANS KICK ──
      sans_kick_0:  'spr_sanskick_0.png',
      sans_kick_1:  'spr_sanskick_1.png',
      sans_kick_2:  'spr_sanskick_2.png',
      sans_kick_3:  'spr_sanskick_3.png',
      sans_kick_4:  'spr_sanskick_4.png',
      sans_kick_5:  'spr_sanskick_5.png',
      sans_kick_6:  'spr_sanskick_6.png',
      sans_kick_7:  'spr_sanskick_7.png',
      sans_kick_8:  'spr_sanskick_8.png',
      sans_kick_9:  'spr_sanskick_9.png',
      sans_kick_10: 'spr_sanskick_10.png',
      sans_kick_11: 'spr_sanskick_11.png',
      sans_kick_12: 'spr_sanskick_12.png',
      sans_kick_13: 'spr_sanskick_13.png',
      sans_kick_14: 'spr_sanskick_14.png',
      sans_kick_15: 'spr_sanskick_15.png',
      sans_kick_16: 'spr_sanskick_16.png',
      sans_kick_17: 'spr_sanskick_17.png',
      sans_kick_18: 'spr_sanskick_18.png',

      // ── SANS COLLAPSE / FALLBACK ──
      sans_collapse_0: 'spr_sanscollapse_0.png',
      sans_collapse_1: 'spr_sanscollapse_1.png',
      sans_collapse_2: 'spr_sanscollapse_2.png',
      sans_collapse_3: 'spr_sanscollapse_3.png',
      sans_fallback_0:  'spr_sansfallback_0.png',
      sans_fallback_1:  'spr_sansfallback_1.png',
      sans_fallback_2:  'spr_sansfallback_2.png',
      sans_fallback_3:  'spr_sansfallback_3.png',
      sans_fallback_4:  'spr_sansfallback_4.png',
      sans_fallback_5:  'spr_sansfallback_5.png',
      sans_fallback_6:  'spr_sansfallback_6.png',
      sans_fallback_7:  'spr_sansfallback_7.png',
      sans_fallback_8:  'spr_sansfallback_8.png',
      sans_fallback_9:  'spr_sansfallback_9.png',
      sans_fallback_10: 'spr_sansfallback_10.png',
      sans_fallback_11: 'spr_sansfallback_11.png',
      sans_fallback_12: 'spr_sansfallback_12.png',
      sans_fallback_13: 'spr_sansfallback_13.png',
      sans_fallback_14: 'spr_sansfallback_14.png',
      sans_fallback_15: 'spr_sansfallback_15.png',
      sans_fallback_16: 'spr_sansfallback_16.png',
      sans_fallback_17: 'spr_sansfallback_17.png',
      sans_fallback_18: 'spr_sansfallback_18.png',
      sans_fallback_19: 'spr_sansfallback_19.png',
      sans_fallback_20: 'spr_sansfallback_20.png',
      sans_fallback_21: 'spr_sansfallback_21.png',
      sans_fallback_22: 'spr_sansfallback_22.png',
      sans_fallback_23: 'spr_sansfallback_23.png',
      sans_fallback_24: 'spr_sansfallback_24.png',
      sans_fallingdown_0: 'spr_sansfallingdown_0.png',
      sans_fallingdown_1: 'spr_sansfallingdown_1.png',
      sans_fallingdown_2: 'spr_sansfallingdown_2.png',
      sans_fallingdown_3: 'spr_sansfallingdown_3.png',
      sans_fallingback: 'spr_sansfallingback.png',

      // ── SANS LOST ENERGY (near death) ──
      sans_lost_0:  'spr_sansLostEn_0.png',
      sans_lost_1:  'spr_sansLostEn_1.png',
      sans_lost_2:  'spr_sansLostEn_2.png',
      sans_lost_3:  'spr_sansLostEn_3.png',
      sans_lost_4:  'spr_sansLostEn_4.png',
      sans_lost_5:  'spr_sansLostEn_5.png',
      sans_lost_6:  'spr_sansLostEn_6.png',
      sans_lost_7:  'spr_sansLostEn_7.png',
      sans_lost_8:  'spr_sansLostEn_8.png',
      sans_lost_9:  'spr_sansLostEn_9.png',
      sans_lost_10: 'spr_sansLostEn_10.png',
      sans_lost_11: 'spr_sansLostEn_11.png',
      sans_lost_12: 'spr_sansLostEn_12.png',
      sans_lost_13: 'spr_sansLostEn_13.png',
      sans_lost_14: 'spr_sansLostEn_14.png',
      sans_lost_15: 'spr_sansLostEn_15.png',
      sans_lost_16: 'spr_sansLostEn_16.png',
      sans_lost_17: 'spr_sansLostEn_17.png',
      sans_lost_18: 'spr_sansLostEn_18.png',
      sans_lost_19: 'spr_sansLostEn_19.png',
      sans_lost_20: 'spr_sansLostEn_20.png',
      sans_lost_21: 'spr_sansLostEn_21.png',
      sans_lost_22: 'spr_sansLostEn_22.png',

      // ── SANS FINAL BLAST (Time To End) ──
      sans_tte_0:  'spr_sanstimetoend_0.png',
      sans_tte_1:  'spr_sanstimetoend_1.png',
      sans_tte_2:  'spr_sanstimetoend_2.png',
      sans_tte_3:  'spr_sanstimetoend_3.png',
      sans_tte_4:  'spr_sanstimetoend_4.png',
      sans_tte_5:  'spr_sanstimetoend_5.png',
      sans_tte_6:  'spr_sanstimetoend_6.png',
      sans_tte_7:  'spr_sanstimetoend_7.png',
      sans_tte_8:  'spr_sanstimetoend_8.png',
      sans_tte_9:  'spr_sanstimetoend_9.png',
      sans_tte_10: 'spr_sanstimetoend_10.png',
      sans_tte_11: 'spr_sanstimetoend_11.png',
      sans_tte_12: 'spr_sanstimetoend_12.png',
      sans_tte_13: 'spr_sanstimetoend_13.png',
      sans_tte_14: 'spr_sanstimetoend_14.png',
      sans_tte_15: 'spr_sanstimetoend_15.png',
      sans_tte_16: 'spr_sanstimetoend_16.png',
      sans_tte_17: 'spr_sanstimetoend_17.png',
      sans_tte_18: 'spr_sanstimetoend_18.png',

      // ── SANS FINAL BLASTER (sansfianlblast) ──
      sans_fb_0:  'spr_sansfianlblast_0.png',
      sans_fb_1:  'spr_sansfianlblast_1.png',
      sans_fb_2:  'spr_sansfianlblast_2.png',
      sans_fb_3:  'spr_sansfianlblast_3.png',
      sans_fb_4:  'spr_sansfianlblast_4.png',
      sans_fb_5:  'spr_sansfianlblast_5.png',
      sans_fb_6:  'spr_sansfianlblast_6.png',
      sans_fb_7:  'spr_sansfianlblast_7.png',
      sans_fb_8:  'spr_sansfianlblast_8.png',
      sans_fb_9:  'spr_sansfianlblast_9.png',
      sans_fb_10: 'spr_sansfianlblast_10.png',
      sans_fb_11: 'spr_sansfianlblast_11.png',
      sans_fb_12: 'spr_sansfianlblast_12.png',

      // ── SANS PHASE 2 BODY & HEAD ──
      sans_p2_body_0:  'spr_p2b_0.png',
      sans_p2_body_1:  'spr_p2b_1.png',
      sans_p2_body_2:  'spr_p2b_2.png',
      sans_p2_body_3:  'spr_p2b_3.png',
      sans_p2_body_4:  'spr_p2b_4.png',
      sans_p2_body_5:  'spr_p2b_5.png',
      sans_p2_body_6:  'spr_p2b_6.png',
      sans_p2_body_7:  'spr_p2b_7.png',
      sans_p2_head_0:  'spr_p2h_0.png',
      sans_p2_head_1:  'spr_p2h_1.png',
      sans_p2_head_2:  'spr_p2h_2.png',
      sans_p2_head_3:  'spr_p2h_3.png',
      sans_p2_head_4:  'spr_p2h_4.png',
      sans_p2_head_5:  'spr_p2h_5.png',
      sans_p2_head_6:  'spr_p2h_6.png',
      sans_p2_head_7:  'spr_p2h_7.png',
      sans_p2_head_8:  'spr_p2h_8.png',
      sans_p2_head_9:  'spr_p2h_9.png',
      sans_p2_head_10: 'spr_p2h_10.png',
      sans_p2_head_11: 'spr_p2h_11.png',
      sans_p2_head_12: 'spr_p2h_12.png',
      sans_p2_head_13: 'spr_p2h_13.png',
      sans_p2_head_14: 'spr_p2h_14.png',
      sans_p2_head_15: 'spr_p2h_15.png',
      sans_p2_slide_0:  'spr_p2slr_0.png',
      sans_p2_slide_1:  'spr_p2slr_1.png',
      sans_p2_slide_2:  'spr_p2slr_2.png',
      sans_p2_slide_3:  'spr_p2slr_3.png',
      sans_p2_slide_4:  'spr_p2slr_4.png',
      sans_p2_sud_0:  'spr_p2sud_0.png',
      sans_p2_sud_1:  'spr_p2sud_1.png',
      sans_p2_sud_2:  'spr_p2sud_2.png',
      sans_p2_sud_3:  'spr_p2sud_3.png',
      sans_p2_sud_4:  'spr_p2sud_4.png',

      // ── SANS BLOCK ──
      sans_block_0: 'spr_boneblockedsans_0.png',
      sans_block_1: 'spr_boneblockedsans_1.png',
      sans_block_2: 'spr_boneblockedsans_2.png',
      sans_block_3: 'spr_boneblockedsans_3.png',
      sans_block_4: 'spr_boneblockedsans_4.png',
      sans_block_5: 'spr_boneblockedsans_5.png',
      sans_block_6: 'spr_boneblockedsans_6.png',
      sans_block_7: 'spr_boneblockedsans_7.png',

      // ── SANS PHASE 3 ──
      sans_p3: 'spr_p3Sans.png',
      sans_p3_body_0: 'spr_p3b_0.png',
      sans_p3_body_1: 'spr_p3b_1.png',
      sans_p3_body_2: 'spr_p3b_2.png',
      sans_p3_head_0:  'spr_p3h_0.png',
      sans_p3_head_1:  'spr_p3h_1.png',
      sans_p3_head_2:  'spr_p3h_2.png',
      sans_p3_head_3:  'spr_p3h_3.png',
      sans_p3_head_4:  'spr_p3h_4.png',
      sans_p3_head_5:  'spr_p3h_5.png',
      sans_p3_head_6:  'spr_p3h_6.png',
      sans_p3_head_7:  'spr_p3h_7.png',
      sans_p3_head_8:  'spr_p3h_8.png',
      sans_p3_head_9:  'spr_p3h_9.png',
      sans_p3_head_10: 'spr_p3h_10.png',
      sans_p3_head_11: 'spr_p3h_11.png',
      sans_p3_head_12: 'spr_p3h_12.png',
      sans_p3_head_13: 'spr_p3h_13.png',
      sans_p3_head_14: 'spr_p3h_14.png',
      sans_p3_head_15: 'spr_p3h_15.png',
      sans_p3_legs_0: 'spr_p3l_0.png',
      sans_p3_legs_1: 'spr_p3l_1.png',
      sans_p3_arms_0: 'spr_p3a_0.png',
      sans_p3_arms_1: 'spr_p3a_1.png',
      sans_shadow_0: 'spr_lbp1_shadow_0.png',
      sans_shadow_1: 'spr_lbp1_shadow_1.png',
      sans_shadow_2: 'spr_lbp1_shadow_2.png',
      sans_behind_0: 'spr_sansbehind_0.png',
      sans_behind_1: 'spr_sansbehind_1.png',
      sans_pillar_0: 'spr_sanspillar_0.png',
      sans_pillar_1: 'spr_sanspillar_1.png',
      sans_hands_0:  'spr_sanshands_0.png',
      sans_hands_1:  'spr_sanshands_1.png',

      // ── IRELIA (Phase 3 aura) ──
      sans_irelia_0:  'spr_sansirelia_0.png',
      sans_irelia_1:  'spr_sansirelia_1.png',
      sans_irelia_2:  'spr_sansirelia_2.png',
      sans_irelia_3:  'spr_sansirelia_3.png',
      sans_irelia_4:  'spr_sansirelia_4.png',
      sans_irelia_5:  'spr_sansirelia_5.png',
      sans_irelia_6:  'spr_sansirelia_6.png',
      sans_irelia_7:  'spr_sansirelia_7.png',
      sans_irelia_8:  'spr_sansirelia_8.png',
      sans_irelia_9:  'spr_sansirelia_9.png',
      sans_irelia_10: 'spr_sansirelia_10.png',
      sans_irelia_11: 'spr_sansirelia_11.png',
      sans_irelia_12: 'spr_sansirelia_12.png',
      sans_irelia_13: 'spr_sansirelia_13.png',
      sans_irelia_14: 'spr_sansirelia_14.png',
      sans_irelia_15: 'spr_sansirelia_15.png',
      sans_irelia_16: 'spr_sansirelia_16.png',
      sans_irelia_17: 'spr_sansirelia_17.png',

      // ── SANS WALKING ──
      sans_walk_0:   'spr_sanswalking_0.png',
      sans_walk_1:   'spr_sanswalking_1.png',
      sans_walk_2:   'spr_sanswalking_2.png',
      sans_walk_3:   'spr_sanswalking_3.png',
      sans_walk1_0:  'spr_sanswalking1_0.png',
      sans_walk1_1:  'spr_sanswalking1_1.png',
      sans_walk1_2:  'spr_sanswalking1_2.png',
      sans_walk0_0:  'spr_sanswalking0_0.png',
      sans_walk0_1:  'spr_sanswalking0_1.png',
      sans_walk0_2:  'spr_sanswalking0_2.png',
      sans_walk0_3:  'spr_sanswalking0_3.png',
      sans_walk0_4:  'spr_sanswalking0_4.png',
      sans_walk0_5:  'spr_sanswalking0_5.png',
      sans_walk0_6:  'spr_sanswalking0_6.png',
      sans_walk0_7:  'spr_sanswalking0_7.png',
      sans_walk0_8:  'spr_sanswalking0_8.png',
      sans_walk0_9:  'spr_sanswalking0_9.png',
      sans_walk0_10: 'spr_sanswalking0_10.png',

      // ── SANS KNEE / KNOCKDOWN ──
      sans_knee_0:  'spr_sanskneeup_0.png',
      sans_knee_1:  'spr_sanskneeup_1.png',
      sans_knee_2:  'spr_sanskneeup_2.png',
      sans_knee1_0: 'spr_sanskneeup1_0.png',
      sans_knee1_1: 'spr_sanskneeup1_1.png',
      sans_knockdown_0: 'spr_sansknockdown_0.png',
      sans_knockdown_1: 'spr_sansknockdown_1.png',
      sans_knockdown_2: 'spr_sansknockdown_2.png',
      sans_knockdown_3: 'spr_sansknockdown_3.png',

      // ── SANS HOODING ──
      sans_hood_0:  'spr_sans_hooding_0.png',
      sans_hood_1:  'spr_sans_hooding_1.png',
      sans_hood_2:  'spr_sans_hooding_2.png',
      sans_hood_3:  'spr_sans_hooding_3.png',
      sans_hood_4:  'spr_sans_hooding_4.png',
      sans_hood_5:  'spr_sans_hooding_5.png',
      sans_hood_6:  'spr_sans_hooding_6.png',
      sans_hood_7:  'spr_sans_hooding_7.png',
      sans_hood_8:  'spr_sans_hooding_8.png',
      sans_hood_9:  'spr_sans_hooding_9.png',
      sans_hood_10: 'spr_sans_hooding_10.png',
      sans_hood_11: 'spr_sans_hooding_11.png',

      // ── EYES ──
      sans_eye_0: 'spr_sanseye_0.png',
      sans_eye_1: 'spr_sanseye_1.png',
      sans_eye_2: 'spr_sanseye_2.png',
      sans_eye_shine0_0: 'spr_sanseye_shine0_0.png',
      sans_eye_shine0_1: 'spr_sanseye_shine0_1.png',
      sans_eye_shine0_2: 'spr_sanseye_shine0_2.png',
      sans_eye_shine0_3: 'spr_sanseye_shine0_3.png',

      // ── PROJECTILES & ATTACKS ──
      bone:       'spr_bone_sans.png',
      bone_top:   'spr_bone_top_0.png',
      bone_mid:   'spr_bone_middle_0.png',
      bone_big:   'spr_bigbone_0.png',
      bone_big_1: 'spr_bigbone_1.png',
      bone_big_2: 'spr_bigbone_2.png',
      bone_big_3: 'spr_bigbone_3.png',
      bone_big_4: 'spr_bigbone_4.png',
      bone_big_5: 'spr_bigbone_5.png',
      bone_big_6: 'spr_bigbone_6.png',
      bone_big_7: 'spr_bigbone_7.png',
      bone_big_8: 'spr_bigbone_8.png',
      bone_papyrus: 'spr_bone_papyrus.png',
      bone_block_0: 'spr_boneblocked_0.png',
      bone_block_1: 'spr_boneblocked_1.png',
      bone_block_2: 'spr_boneblocked_2.png',
      bone_block_3: 'spr_boneblocked_3.png',
      bone_cycle_0: 'spr_bullet_cyclebone_0.png',
      bone_cycle_1: 'spr_bullet_cyclebone_1.png',
      bone_cycle_2: 'spr_bullet_cyclebone_2.png',
      bone_cycle_3: 'spr_bullet_cyclebone_3.png',
      bone_cycle_4: 'spr_bullet_cyclebone_4.png',
      bone_cycle_5: 'spr_bullet_cyclebone_5.png',

      // ── BLASTERS ──
      blaster_0: 'spr_blaster_0.png',
      blaster_1: 'spr_blaster_1.png',
      blaster_2: 'spr_blaster_2.png',
      blaster_3: 'spr_blaster_3.png',
      blaster_4: 'spr_blaster_4.png',
      blaster_5: 'spr_blaster_5.png',
      blaster_big_0: 'spr_bigblaster_0.png',
      blaster_big_1: 'spr_bigblaster_1.png',
      blaster_big_2: 'spr_bigblaster_2.png',
      blaster_big_3: 'spr_bigblaster_3.png',
      blaster_big_4: 'spr_bigblaster_4.png',
      blaster_big_5: 'spr_bigblaster_5.png',
      blaster_big_6: 'spr_bigblaster_6.png',
      blaster2_0: 'spr_bigblaster2_0.png',
      blaster2_1: 'spr_bigblaster2_1.png',
      blaster2_2: 'spr_bigblaster2_2.png',
      blaster2_3: 'spr_bigblaster2_3.png',
      blaster2_4: 'spr_bigblaster2_4.png',
      blaster1_0: 'spr_bigblaster1_0.png',
      blaster1_1: 'spr_bigblaster1_1.png',
      blaster1_2: 'spr_bigblaster1_2.png',
      blaster1_3: 'spr_bigblaster1_3.png',
      blaster1_4: 'spr_bigblaster1_4.png',
      blasterp_0: 'spr_bigblasterp0_0.png',
      blasterp_1: 'spr_bigblasterp0_1.png',

      // ── SLASH / FIGHT TARGET ──
      target_0: 'spr_fight_target_0.png',
      target_1: 'spr_fight_target_1.png',
      slash_0:  'spr_fight_slash_0.png',
      slash_1:  'spr_fight_slash_1.png',
      slash_2:  'spr_fight_slash_2.png',
      slash_3:  'spr_fight_slash_3.png',
      slash_4:  'spr_fight_slash_4.png',
      slash_5:  'spr_fight_slash_5.png',
      slash_6:  'spr_fight_slash_6.png',
      slash_7:  'spr_fight_slash_7.png',
      slash_8:  'spr_fight_slash_8.png',
      slash_9:  'spr_fight_slash_9.png',
      slash_10: 'spr_fight_slash_10.png',

      // ── BACKGROUNDS ──
      bg_classic:  'spr_fight_bg.png',
      bg_lb:       'spr_fight_bglb.png',
      bg_sans:     'spr_fight_bgsans.png',
      dialogue_box: 'spr_dialogue.png',

      // ── EFFECTS ──
      dustcloud_0: 'spr_dustcloud_0.png',
      dustcloud_1: 'spr_dustcloud_1.png',
      dustcloud_2: 'spr_dustcloud_2.png',
      shadow_eff_0: 'spr_sanshadeff_0.png',
      shadow_eff_1: 'spr_sanshadeff_1.png',
      shadow_eff_2: 'spr_sanshadeff_2.png',
      shadow_eff_3: 'spr_sanshadeff_3.png',
      heal_eff_0: 'spr_healeffect_0.png',
      heal_eff_1: 'spr_healeffect_1.png',
      heal_eff_2: 'spr_healeffect_2.png',
      heal_eff_3: 'spr_healeffect_3.png',
      heal_eff_4: 'spr_healeffect_4.png',
      heal_eff_5: 'spr_healeffect_5.png',
      slow_soul_0: 'spr_slowsouleff_0.png',
      slow_soul_1: 'spr_slowsouleff_1.png',
      slow_soul_2: 'spr_slowsouleff_2.png',
      slow_soul_3: 'spr_slowsouleff_3.png',
      slow_soul_4: 'spr_slowsouleff_4.png',
      slow_soul_5: 'spr_slowsouleff_5.png',
      buttoneff_0: 'spr_buttoneff_0.png',
      buttoneff_1: 'spr_buttoneff_1.png',
      buttoneff_2: 'spr_buttoneff_2.png',
      // targets
      target0_0: 'spr_target0_0.png',
      target0_1: 'spr_target0_1.png',
      target0_2: 'spr_target0_2.png',
      target0_3: 'spr_target0_3.png',
      target1_0: 'spr_target1_0.png',
      target1_1: 'spr_target1_1.png',
      target1_2: 'spr_target1_2.png',
      target1_3: 'spr_target1_3.png',
      target1_4: 'spr_target1_4.png',
      target1_5: 'spr_target1_5.png',
    };
  }

  async loadAll() {
    const keys = Object.keys(this.manifest);
    this.totalCount = keys.length;
    const basePath = 'assets/sprites/';
    const v = Date.now();

    const promises = keys.map(key => new Promise(resolve => {
      const img = new Image();
      img.onload = () => { this.images[key] = img; this.loadedCount++; resolve(); };
      img.onerror = () => { this.loadedCount++; resolve(); };
      img.src = basePath + this.manifest[key] + '?v=' + v;
    }));

    await Promise.all(promises);
    this.ready = true;
    console.log(`Sprites: ${this.loadedCount}/${this.totalCount} loaded`);
  }

  get(name) { return this.images[name] || null; }

  has(name) { return !!this.images[name]; }

  /**
   * Draw an image centered at (x, y) with optional rotation, scale, alpha, flipX
   */
  draw(ctx, name, x, y, opts = {}) {
    const img = this.images[name];
    if (!img) return;
    const scale    = opts.scale    !== undefined ? opts.scale    : 1.0;
    const rotation = opts.rotation || 0;
    const alpha    = opts.alpha    !== undefined ? opts.alpha    : 1.0;
    const flipX    = opts.flipX    || false;
    const tint     = opts.tint     || null;

    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (rotation !== 0) ctx.rotate(rotation);
    if (flipX) ctx.scale(-1, 1);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    if (tint) {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.drawImage(img, -Math.round(img.width / 2), -Math.round(img.height / 2));
    ctx.restore();
  }

  /**
   * Draw a game-style bone (white, blue, or orange) with proper Undertale knobs
   */
  drawBone(ctx, x, y, width, height, type = 'white', angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    if (angle !== 0) ctx.rotate(angle);

    const color = type === 'blue'   ? '#00d4ff'
                : type === 'orange' ? '#ff9100'
                : type === 'purple' ? '#b5179e'
                : '#ffffff';
    const shadow = type === 'blue'   ? '#006699'
                 : type === 'orange' ? '#883300'
                 : type === 'purple' ? '#660066'
                 : '#888888';

    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = type !== 'white' ? 6 : 0;

    // Main shaft
    ctx.fillRect(-width/2, -height/2, width, height);

    // Caps (knobs at ends)
    const cw = width + 4;
    const ch = 5;
    ctx.fillStyle = color;
    ctx.fillRect(-cw/2, -height/2 - 1, cw, ch);
    ctx.fillRect(-cw/2, height/2 - ch + 1, cw, ch);

    ctx.restore();
  }
}

window.sprites = new SpriteManager();
