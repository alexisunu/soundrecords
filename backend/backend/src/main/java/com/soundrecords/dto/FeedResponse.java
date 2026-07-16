package com.soundrecords.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
public class FeedResponse {
    private List<ReviewFeedItem> reviews;
    private Integer page;
    private Boolean hasMore;
}